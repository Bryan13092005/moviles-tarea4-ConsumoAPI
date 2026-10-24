import { useCallback, useMemo, useState } from 'react';
import { FlatList, Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraMensaje } from '@/components/barra-mensaje';
import { Boton } from '@/components/boton';
import { EstadoConexion } from '@/components/estado-conexion';
import { Esqueleto } from '@/components/esqueleto';
import { FormularioNota, ValoresNota } from '@/components/formulario-nota';
import { TarjetaNota } from '@/components/tarjeta-nota';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useCambiosPendientes } from '@/hooks/useCambiosPendientes';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useMensaje } from '@/hooks/useMensaje';
import { useCrearNota, useNotas, useNotasPorElemento } from '@/hooks/useNotas';
import { Pokemon } from '@/types/index';

interface Props {
  pokemon: Pokemon | null;
  onCerrar: () => void;
}

// Vista modal con las notas de un Pokémon; solo permite crear y consultar
export function PanelNotas({ pokemon, onCerrar }: Props) {
  const theme = useTheme();
  return (
    <Modal visible={!!pokemon} animationType="slide" presentationStyle="pageSheet" onRequestClose={onCerrar}>
      <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
        {pokemon && <ContenidoPanel pokemon={pokemon} onCerrar={onCerrar} />}
      </SafeAreaView>
    </Modal>
  );
}

function ContenidoPanel({ pokemon, onCerrar }: { pokemon: Pokemon; onCerrar: () => void }) {
  const online = useIsOnline();
  const { mensaje, mostrar } = useMensaje();
  const [editor, setEditor] = useState(false);

  const porElemento = useNotasPorElemento(pokemon.id);
  const todas = useNotas();
  const cambios = useCambiosPendientes();
  const crear = useCrearNota();

  // Sin caché propia del elemento (p. ej. creada sin conexión), se usa la lista general
  const notas = useMemo(() => {
    const origen = porElemento.data ?? todas.data ?? [];
    return origen.filter((n) => Number(n.itemId) === pokemon.id);
  }, [porElemento.data, todas.data, pokemon.id]);

  const idsEditando = useMemo(
    () => new Set(cambios.filter((c) => c.tipo === 'editar').map((c) => (c.variables as { id: string }).id)),
    [cambios],
  );

  const guardar = useCallback(
    (valores: ValoresNota) => {
      crear.mutate({ ...valores, imgUrl: pokemon.imagen, itemId: pokemon.id });
      mostrar(online ? 'Nota guardada' : 'Guardado localmente, se enviará al reconectar');
      setEditor(false);
    },
    [crear, pokemon, online, mostrar],
  );

  if (editor) {
    return <FormularioNota titulo="Nueva nota" onGuardar={guardar} onCancelar={() => setEditor(false)} />;
  }

  const cargando = porElemento.isLoading && !todas.data;

  return (
    <View style={styles.flex}>
      <View style={styles.cabecera}>
        <View style={styles.titulos}>
          <ThemedText type="subtitle" style={styles.titulo} numberOfLines={1}>
            {pokemon.nombre}
          </ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            Notas del elemento #{pokemon.id}
          </ThemedText>
        </View>
        <Boton titulo="Cerrar" variante="secundario" onPress={onCerrar} />
      </View>
      <View style={styles.conexion}>
        <EstadoConexion />
      </View>

      <FlatList
        data={notas}
        keyExtractor={(n) => n.id}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={Separador}
        renderItem={({ item }) => (
          <TarjetaNota nota={item} pendiente={idsEditando.has(item.id)} soloLectura />
        )}
        ListHeaderComponent={
          <View style={styles.encabezadoLista}>
            <Boton titulo="+ Nueva nota" onPress={() => setEditor(true)} />
            <ThemedText type="small" themeColor="textSecondary">
              Para editar o eliminar notas, ve a la pestaña Sincronización.
            </ThemedText>
          </View>
        }
        ListEmptyComponent={
          cargando ? (
            <View style={styles.separador}>
              <Esqueleto alto={90} />
              <Esqueleto alto={90} />
            </View>
          ) : porElemento.isError && !porElemento.data ? (
            <View style={styles.vacio}>
              <ThemedText type="small" themeColor="textSecondary">
                No se pudieron cargar las notas.
              </ThemedText>
              <Boton titulo="Reintentar" onPress={() => porElemento.refetch()} />
            </View>
          ) : (
            <View style={styles.vacio}>
              <ThemedText type="smallBold">Aún no hay notas</ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Crea la primera nota de {pokemon.nombre}.
              </ThemedText>
            </View>
          )
        }
      />
      <BarraMensaje mensaje={mensaje} />
    </View>
  );
}

const Separador = () => <View style={styles.espacio} />;

const styles = StyleSheet.create({
  flex: { flex: 1 },
  espacio: { height: 12 },
  cabecera: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, paddingBottom: 8 },
  titulos: { flex: 1 },
  titulo: { fontSize: 26, lineHeight: 34 },
  conexion: { paddingHorizontal: 16 },
  lista: { padding: 16, paddingBottom: 96 },
  encabezadoLista: { marginBottom: 12, gap: 8 },
  separador: { gap: 12 },
  vacio: { alignItems: 'center', gap: 8, paddingVertical: 32 },
});
