import { QueryClient, QueryKey, onlineManager } from '@tanstack/react-query';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { userService } from '@/api/pokemon.service';
import { clavesConsulta, clavesMutacion } from '@/config/queryKeys';
import { EdicionNota, EliminacionNota, NotaUsuario, NuevaNota } from '@/types/index';
import { log } from '@/utils/log';

// Vigencia de la caché persistida; gcTime debe ser >= a este valor
export const MAX_AGE = 1000 * 60 * 60 * 24;

// Escuchador de conectividad a la red mediante NetInfo
onlineManager.setEventListener((establecerEstadoRed) => {
  return NetInfo.addEventListener((estado) => {
    establecerEstadoRed(estado.isConnected !== false && estado.isInternetReachable !== false);
  });
});

const estadoRed = (online: boolean) => (online ? 'Online' : 'Offline');
log('RED', estadoRed(onlineManager.isOnline()));
onlineManager.subscribe((online) => log('RED', estadoRed(online)));

export const clienteConsulta = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: MAX_AGE,
    },
    mutations: {
      gcTime: MAX_AGE, // las mutaciones pausadas deben sobrevivir tanto como la caché persistida
      retry: 3,
    },
  },
});

// API pública: datos casi estáticos
clienteConsulta.setQueryDefaults(clavesConsulta.catalogoPublico.todas, {
  staleTime: 1000 * 60 * 60,
});

// MockAPI: datos editables por el usuario (aplica a lista, detalle y porElemento)
clienteConsulta.setQueryDefaults(clavesConsulta.notasUsuario.todas, {
  staleTime: 1000 * 30,
});

const PREFIJO_ID_TEMPORAL = 'temp-';
const esIdTemporal = (id: string) => id.startsWith(PREFIJO_ID_TEMPORAL);

// Una nota creada sin conexión solo existe en la caché local hasta que se sincroniza:
// editarla o eliminarla antes de eso no puede llamar a MockAPI, así que se revierte el cambio optimista.
class NotaTemporalError extends Error {
  constructor() {
    super('La nota aún no se ha sincronizado con MockAPI');
  }
}

const reintentar = (intentos: number, error: Error) => !(error instanceof NotaTemporalError) && intentos < 3;

type Instantanea = (readonly [QueryKey, unknown])[];

// Guarda el estado actual de las claves y cancela refetches que lo sobrescribirían
async function preparar(claves: QueryKey[]): Promise<Instantanea> {
  await Promise.all(claves.map((queryKey) => clienteConsulta.cancelQueries({ queryKey })));
  return claves.map((clave) => [clave, clienteConsulta.getQueryData(clave)] as const);
}

function revertir(instantanea?: Instantanea) {
  instantanea?.forEach(([clave, datos]) => clienteConsulta.setQueryData(clave, datos));
}

// Aplica un cambio sobre un arreglo de notas solo si ya está en caché
function modificarLista(clave: QueryKey, cambio: (notas: NotaUsuario[]) => NotaUsuario[]) {
  clienteConsulta.setQueryData<NotaUsuario[]>(clave, (old) => (old ? cambio(old) : old));
}

function invalidarNota(itemId: number, id?: string) {
  clienteConsulta.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.lista() });
  clienteConsulta.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.porElemento(itemId) });
  if (id) clienteConsulta.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.detalle(id) });
}

// Las mutaciones pausadas se persisten sin funciones: se registran por mutationKey para poder reanudarlas
const registrada = (accion: string) =>
  log('MUTACIÓN', `${accion} registrada (pausada: ${onlineManager.isOnline() ? 'no' : 'sí'})`);
const exito = (metodo: string, detalle = '') => log('MUTACIÓN', `${metodo} OK${detalle}`);
const fallo = (metodo: string, error: Error) => log('MUTACIÓN', `${metodo} falló: ${error.message}`);

clienteConsulta.setMutationDefaults(clavesMutacion.crearNota, {
  mutationFn: (nota: NuevaNota) => {
    log('MUTACIÓN', 'Enviando POST a MockAPI');
    return userService.add(nota);
  },
  onSuccess: (data) => exito('POST', `, id=${data.id}`),
  onMutate: async (nota: NuevaNota) => {
    registrada('Crear');
    const instantanea = await preparar([
      clavesConsulta.notasUsuario.lista(),
      clavesConsulta.notasUsuario.porElemento(nota.itemId),
    ]);
    const optimista: NotaUsuario = {
      ...nota,
      id: `${PREFIJO_ID_TEMPORAL}${Date.now()}`,
      createdAt: Math.floor(Date.now() / 1000),
      isPending: true,
    };
    modificarLista(clavesConsulta.notasUsuario.lista(), (notas) => [...notas, optimista]);
    modificarLista(clavesConsulta.notasUsuario.porElemento(nota.itemId), (notas) => [...notas, optimista]);
    return { instantanea };
  },
  onError: (error, _nota, contexto) => {
    fallo('POST', error);
    revertir(contexto?.instantanea);
  },
  onSettled: (_data, _error, nota) => invalidarNota(nota.itemId),
  retry: reintentar,
});

clienteConsulta.setMutationDefaults(clavesMutacion.editarNota, {
  mutationFn: (edicion: EdicionNota) => {
    if (esIdTemporal(edicion.id)) throw new NotaTemporalError();
    log('MUTACIÓN', 'Enviando PUT a MockAPI');
    return userService.update(edicion);
  },
  onSuccess: (data) => exito('PUT', `, id=${data.id}`),
  onMutate: async (edicion: EdicionNota) => {
    registrada('Editar');
    const claveDetalle = clavesConsulta.notasUsuario.detalle(edicion.id);
    const instantanea = await preparar([
      clavesConsulta.notasUsuario.lista(),
      clavesConsulta.notasUsuario.porElemento(edicion.itemId),
      claveDetalle,
    ]);
    const aplicar = (nota: NotaUsuario): NotaUsuario => ({ ...nota, ...edicion, isPending: true });
    const reemplazar = (notas: NotaUsuario[]) => notas.map((nota) => (nota.id === edicion.id ? aplicar(nota) : nota));
    modificarLista(clavesConsulta.notasUsuario.lista(), reemplazar);
    modificarLista(clavesConsulta.notasUsuario.porElemento(edicion.itemId), reemplazar);
    clienteConsulta.setQueryData<NotaUsuario>(claveDetalle, (old) => (old ? aplicar(old) : old));
    return { instantanea };
  },
  onError: (error, _edicion, contexto) => {
    fallo('PUT', error);
    revertir(contexto?.instantanea);
  },
  onSettled: (_data, _error, edicion) => invalidarNota(edicion.itemId, edicion.id),
  retry: reintentar,
});

clienteConsulta.setMutationDefaults(clavesMutacion.eliminarNota, {
  mutationFn: ({ id }: EliminacionNota) => {
    if (esIdTemporal(id)) throw new NotaTemporalError();
    log('MUTACIÓN', 'Enviando DELETE a MockAPI');
    return userService.delete(id);
  },
  onSuccess: (_data, { id }) => exito('DELETE', `, id=${id}`),
  onMutate: async ({ id, itemId }: EliminacionNota) => {
    registrada('Eliminar');
    const instantanea = await preparar([
      clavesConsulta.notasUsuario.lista(),
      clavesConsulta.notasUsuario.porElemento(itemId),
      clavesConsulta.notasUsuario.detalle(id),
    ]);
    const quitar = (notas: NotaUsuario[]) => notas.filter((nota) => nota.id !== id);
    modificarLista(clavesConsulta.notasUsuario.lista(), quitar);
    modificarLista(clavesConsulta.notasUsuario.porElemento(itemId), quitar);
    return { instantanea };
  },
  onError: (error, _vars, contexto) => {
    fallo('DELETE', error);
    revertir(contexto?.instantanea);
  },
  onSettled: (_data, _error, { id, itemId }) => invalidarNota(itemId, id),
  retry: reintentar,
});

// Persistidor que sincroniza la caché de TanStack Query en AsyncStorage
export const persistidorAlmacenamiento = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'CACHE_OFFLINE_CONSUMO_API',
  throttleTime: 1000,
});
