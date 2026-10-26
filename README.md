# ConsumoAPI

Aplicación móvil construida con **Expo / React Native** que consume la API pública de Pokémon (**PokeAPI**) y permite gestionar **PokeNotas** (notas / favoritos) guardadas en **MockAPI**.

Incluye manejo de caché del servidor con **TanStack Query**, persistencia de la caché en **AsyncStorage**, sincronización offline de los cambios y lectura desde caché cuando no hay red.

## Tabla de contenidos

- [Stack](#stack)
- [Requisitos](#requisitos)
- [Cómo correr la app](#cómo-correr-la-app)
- [Variables de entorno](#variables-de-entorno)
- [Archivos críticos](#archivos-criticos)
- [TanStack Query: cómo se maneja](#tanstack-query-cómo-se-maneja)
- [Claves de caché](#claves-de-caché)
- [staleTime y gcTime](#staletime-y-gctime)
- [Invalidación de caché](#invalidación-de-caché)
- [Persistencia](#persistencia)
- [Flujo sin conexión](#flujo-sin-conexión)
- [Lectura offline: catálogo y notas](#lectura-offline-catalogo-y-notas)
- [Ids temporales y limitaciones offline](#ids-temporales-y-limitaciones-offline)
- [Documentación](#documentación)

## Stack

### Framework y UI

| Tecnología | Versión / paquete | ¿Para qué sirve? |
| --- | --- | --- |
| Expo | SDK 57 | Plataforma de desarrollo de React Native con Expo Router, Expo Go y EAS. |
| React Native | 0.86 | Base nativa del renderizado de la app móvil. |
| React | 19 | Motor de renderizado con React Compiler habilitado. |
| Expo Router | ~57 | Navegación **file-based** (las pantas viven en `src/app/`). |
| expo-image | ~57 | Imágenes optimizadas (catálogo de Pokémon). |
| react-native-reanimated | 4.5 | Animaciones (splash overlay). |
| react-native-safe-area-context | ~5.7 | Safe areas en Android/iOS. |
| expo-router tabs / native tabs | ~57 | Pestañas inferiores (Catálogo y Sincronización). |

### Estado del servidor y caché (TanStack Query)

| Tecnología | Paquete | ¿Para qué sirve? |
| --- | --- | --- |
| TanStack Query | `@tanstack/react-query` ^5.104 | Cliente de caché del servidor: `useQuery` para lecturas (catálogo, notas) y `useMutation` para escrituras (crear/editar/eliminar PokeNota), con optimista updates y rollback. |
| Persistencia de caché | `@tanstack/react-query-persist-client` + `@tanstack/query-async-storage-persister` | Guarda/restaura la caché en **AsyncStorage** (`CACHE_OFFLINE_CONSUMO_API`, maxAge 24 h). |
| Conectividad | `@react-native-community/netinfo` | Informa el estado de red; se integra con el `onlineManager` de TanStack para pausar consultas/mutaciones sin red. |

### Datos y red

| Tecnología | Paquete | ¿Para qué sirve? |
| --- | --- | --- |
| Axios | ^1.20 | Cliente HTTP para PokeAPI (`clientPokemon`) y MockAPI (`userClient`), con `baseURL` configurable por variables `EXPO_PUBLIC_*`. |
| AsyncStorage | `@react-native-async-storage/async-storage` | Almacenamiento local de la caché persistida de TanStack Query. |

### Utilidades internas

| Tecnología | Archivo / uso | ¿Para qué sirve? |
| --- | --- | --- |
| `onlineManager` de TanStack | `src/config/queryClient.ts` | Expone el estado online y pausa las peticiones cuando no hay red. |
| `useIsOnline` / `useRecienReconectado` | `src/hooks/useIsOnline.ts` | Hooks de UI para mostrar el estado de conexión y el indicador post-reconexión. |
| `useCambiosPendientes` | `src/hooks/useCambiosPendientes.ts` | Lista de mutaciones pausadas / enviando / fallidas con acciones de reintento y descarte. |
| `useLogCache` | `src/hooks/useLogCache.ts` | Registra en consola (y en el log del APK) cuándo se sirven datos desde caché mientras un GET sigue en curso. |
| `log` | `src/utils/log.ts` | Registro con timestamp (`[HH:mm:ss.SSS] [ETIQUETA] mensaje`) para diagnóstico offline/online. |

### Tabla resumida

| Área | Tecnologías |
| --- | --- |
| Framework / UI | Expo SDK 57, React Native 0.86, React 19, Expo Router, expo-image, react-native-reanimated, react-native-safe-area-context, expo-router tabs |
| Estado del servidor / caché | TanStack Query 5, `@tanstack/react-query-persist-client`, `@tanstack/query-async-storage-persister`, `@react-native-community/netinfo` |
| Red / datos | Axios, AsyncStorage |
| Utilidades internas | `onlineManager`, `useIsOnline`, `useCambiosPendientes`, `useLogCache`, `log` |

## Requisitos

- Bun o Node.js
- Expo Go, development build o emuladores (Android / iOS)

## Cómo correr la app

```bash
# instalar dependencias
bun install

# iniciar el dev server
bunx expo start
```

En el output se ofrecen las opciones para abrirla en:

- development build
- Android emulator
- iOS simulator
- Expo Go

Comandos útiles:

```bash
bunx expo start --android
bunx expo start --ios
bunx expo start --web
bunx expo lint          # lint
bunx tsc --noEmit       # typecheck
bunx eas-cli build --profile development   # build EAS
```

## Variables de entorno

Se configuran en `.env` (exponen las URLs base a través de `EXPO_PUBLIC_*`):

```
EXPO_PUBLIC_POKEAPI_URL=https://pokeapi.co/api/v2/pokemon
EXPO_PUBLIC_MOCKAPI_URL=https://xxxxxx.mockapi.io/
```

## Archivos críticos

| Archivo | Responsabilidad |
| --- | --- |
| `src/config/queryClient.ts` | Instancia `QueryClient` (`clienteConsulta`), defaults de queries y mutations, mutation defaults con optimista updates y rollback, `onlineManager`, persister AsyncStorage. |
| `src/config/queryKeys.ts` | Árbol jerárquico de claves de consulta y de mutación. |
| `src/api/client.ts` | Clientes Axios: `clientPokemon` (PokeAPI) y `userClient` (MockAPI). |
| `src/api/pokemon.service.ts` | Servicios HTTP: catálogo de Pokémon y CRUD de PokeNotas en MockAPI. |
| `src/hooks/usePokemon.ts` | `useQuery` del catálogo público (`catalogoPublico.lista()`). |
| `src/hooks/useNotas.ts` | `useQuery` de notas (lista, detalle, por elemento) y wrappers de mutaciones con sus `onSettled`. |
| `src/hooks/useIsOnline.ts` | Estado online vía `onlineManager` de TanStack + `useRecienReconectado`. |
| `src/hooks/useCambiosPendientes.ts` | `useMutationState` para listar cambios pausados / enviando / fallidos; reintentar y descartar. |
| `src/hooks/useLogCache.ts` | Registra cuando se muestran datos desde caché mientras el GET sigue en curso. |
| `src/app/_layout.tsx` | `PersistQueryClientProvider` + reanudación de mutaciones pausadas al arrancar. |
| `src/app/index.tsx` | Pantalla Catálogo (grid de Pokémon, FlatList con pull-to-refresh). |
| `src/app/explore.tsx` | Pantalla Sincronización y PokeNotas (lista de cambios pendientes, editar/eliminar). |
| `src/types/index.ts` | Tipos (`Pokemon`, `NotaUsuario`, `NuevaNota`, `EdicionNota`, `EliminacionNota`). |

## TanStack Query: cómo se maneja

- Se crea un `QueryClient` singleton en `src/config/queryClient.ts` (`clienteConsulta`) y se comparte con toda la app a través del contexto.
- No se usan `useQueryClient().fetchQuery` directamente en los componentes; las pantallas consumen hooks personalizados (`usePokemon`, `useNotas`).
- El estado de conectividad lo provee el `onlineManager` de TanStack (suscrito a NetInfo), por lo que las consultas y mutaciones se **pausan** automáticamente cuando no hay red.
- Los `staleTime` y `gcTime` se definen con `setQueryDefaults`, agrupando por familia de claves.
- Las mutaciones de notas se registran con `setMutationDefaults` (no solo con `useMutation`), porque así la caché persiste mutaciones **pausadas sin función** y pueden reanudarse tras reiniciar la app.
- Cada mutación define `onMutate` (actualización optimista), `onError` (rollback) y `onSettled` (invalidación).

### Claves de caché (`src/config/queryKeys.ts`)

Árbol jerárquico de claves:

```
catalogoPublico
  → ['catalogoPublico']                      (raíz / familia)
  → ['catalogoPublico', 'lista']            (lista de los 20 primeros Pokémon)
  → ['catalogoPublico', 'detalle', id]     (detalle del Pokémon)

notasUsuario
  → ['notasUsuario']                         (raíz / familia)
  → ['notasUsuario', 'lista']               (lista completa de notas)
  → ['notasUsuario', 'detalle', id]        (detalle de una nota por id)
  → ['notasUsuario', 'porElemento', itemId]  (notas de un Pokémon)

mutaciones
  → ['notasUsuario', 'crear']
  → ['notasUsuario', 'editar']
  → ['notasUsuario', 'eliminar']
```

Como la estructura es jerárquica (prefijos), invalidar una clave padre (`['notasUsuario']`) limpia toda la familia de subclaves que la siguen.

### staleTime y gcTime

| Fase / dato | staleTime | gcTime | Justificación |
| --- | --- | --- | --- |
| API pública / catálogo (`catalogoPublico`) | **1 hora** | **24 horas** (`MAX_AGE`) | Los datos del catálogo casi no cambian: se reutiliza la caché sin hacer refetches repetidos. |
| Notas de usuario (`notasUsuario`) | **30 segundos** | **24 horas** (`MAX_AGE`) | Las notas son editables por el usuario, así que la caché debe refrescarse pronto para reflejar cambios. |

Definiciones:

- **staleTime**: tiempo de validez de los datos. Mientras la caché no está `stale` (es decir, menos tiempo ha pasado desde la última actualización), los componentes consumen los datos guardados sin disparar un refetch. Cuando expira, el siguiente observador dispara el GET en background.
- **gcTime**: tiempo que la caché permanece en memoria antes de ser recolectada (`garbage collected`) cuando ya no hay observadores activos. Con persistencia, `gcTime` debe ser **mayor o igual** a `maxAge` del persister; si fuera menor, una query sin observadores se eliminaría de la memoria antes de persistir/restaurar y se perderían los datos offline tras reiniciar la app.

El valor `MAX_AGE = 1000 * 60 * 60 * 24` (24 horas) se define en `src/config/queryClient.ts` y se usa como `gcTime` de queries y mutations, y como `maxAge` del persister.

## Invalidación de caché

Tras cada mutación, el `onSettled` invalida las claves afectadas con `invalidateQueries`. El helper central es `invalidarNota(itemId, id?)` en `src/config/queryClient.ts`.

| Mutación | Claves invalidadas | Por qué |
| --- | --- | --- |
| Crear nota | `notasUsuario.lista()`, `notasUsuario.porElemento(itemId)` | Aparece la nota nueva en la lista general y en las notas del Pokémon al que pertenece. |
| Editar nota | `notasUsuario.detalle(id)`, `notasUsuario.lista()`, `notasUsuario.porElemento(itemId)` | La nota cambia en su detalle, en la lista y en las notas del elemento. |
| Eliminar nota | `notasUsuario.lista()`, `notasUsuario.porElemento(itemId)`, `notasUsuario.detalle(id)` | La nota desaparece de la lista y de las notas del elemento; el detalle ya no existe en el servidor. |

`catalogoPublico` **nunca** se invalida: las mutaciones solo afectan a MockAPI y el catálogo público es de solo lectura.

## Persistencia

- Se usa `PersistQueryClientProvider` (en `src/app/_layout.tsx`) con el persister `createAsyncStoragePersister` de `@tanstack/query-async-storage-persister`.
- Almacenamiento: **AsyncStorage**, con la clave `CACHE_OFFLINE_CONSUMO_API` y `throttleTime` de 1000 ms.
- `maxAge` del persister: `MAX_AGE` (24 horas).
- Al abrir la app, la caché se restaura desde AsyncStorage y los `useQuery` entregan los datos guardados mientras el GET se actualiza en background.

## Flujo sin conexión

1. `onlineManager` escucha a NetInfo; sin red (`isConnected && isInternetReachable` falsos), las consultas y mutaciones se **pausan** en lugar de fallar.
2. Las mutaciones se registran con `setMutationDefaults` incluyendo `mutationFn`, la actualización optimista (`isPending: true`) y el rollback (`onError` con la instantánea guardada en `onMutate`).
3. Al terminar la restauración de la caché, el `onSuccess` del `PersistQueryClientProvider` llama a `resumePausedMutations()` y luego invalida `notasUsuario` para re-sincronizar.
4. `useCambiosPendientes()` expone las mutaciones pausadas o en curso (vía `useMutationState`) para mostrarlas en la UI: una mutación pausada tiene `status: 'pending'` e `isPaused: true`.

### Cómo se reanudan las mutaciones

- Las mutaciones pausadas se persisten (dehydrate) sin ejecutar; al reiniciar la app se reanudan con `resumePausedMutations()`.
- Al reanudarse ejecutan su `mutationFn` original (registrada por `mutationKey` mediante `setMutationDefaults`), sin volver a correr `onMutate`; la caché optimista ya estaba persistida.

## Lectura offline: catálogo y notas

- **Catálogo (`usePokemon`)**: consulta con `queryKey: ['catalogoPublico', 'lista']` y `queryFn` que obtiene los 20 Pokémon (`?limit=20`) y sus detalles en paralelo. Con `staleTime` de 1 hora y `gcTime` de 24 horas, la app puede mostrar la caché persistida sin red; al reconectar el refetch se dispara cuando la caché esté `stale`. El pull-to-refresh fuerza `refetch()`.
- **Notas (`useNotas`, `useNota`, `useNotasPorElemento`)**: `staleTime` de 30 segundos. Sin red, la app consume la caché (persisted) y, mientras el GET está en curso, `useLogCache` registra que se muestran datos desde caché.

## Ids temporales y limitaciones offline

- Una nota creada sin conexión se muestra con `id` temporal (`temp-…`) e `isPending: true` en `lista` y `porElemento`.
- Si se edita o elimina una nota con id temporal antes de que se sincronice, la mutación **no** llama a MockAPI: el `mutationFn` lanza `NotaTemporalError`, el retry personalizado lo evita, y el `onError` revierte el cambio optimista.
- Hay que esperar a que la creación se sincronice antes de poder editarla o eliminarla.
- Solo se persisten las mutaciones pausadas (dehydrate). Al reiniciar se reanudan con `resumePausedMutations()`.

## Documentación

- [Expo documentation](https://docs.expo.dev/)
- [Expo Router documentation](https://docs.expo.dev/router/introduction)
- [TanStack Query documentation](https://tanstack.com/query/latest)
- [Expo EAS](https://docs.expo.dev/eas/)
