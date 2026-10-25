import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BarraMensaje } from '@/components/barra-mensaje';
import { Boton } from '@/components/boton';
import { EstadoConexion } from '@/components/estado-conexion';
import { FormularioNota, ValoresNota } from '@/components/formulario-nota';
import { ItemCambioPendiente } from '@/components/item-cambio-pendiente';
import { TarjetaNota } from '@/components/tarjeta-nota';
import { ThemedText } from '@/components/themed-text';
import { Paleta, conAlfa } from '@/constants/paleta';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { descartarCambio, reintentarCambio, useCambiosPendientes } from '@/hooks/useCambiosPendientes';
import { useIsOnline } from '@/hooks/useIsOnline';
import { useMensaje } from '@/hooks/useMensaje';
import { useEditarNota, useEliminarNota, useNotas } from '@/hooks/useNotas';
import { NotaUsuario } from '@/types/index';

export default function Sincronizacion() {
  const theme = useTheme();
  const qc = useQueryClient();
  const online = useIsOnline();
  const cambios = useCambiosPendientes();
  const notas = useNotas();
  const editar = useEditarNota();
  const eliminar = useEliminarNota();
  const { mensaje, mostrar } = useMensaje();
  const [editando, setEditando] = useState<NotaUsuario | null>(null);
  const activos = useMemo(() => cambios.filter((c) => c.estado !== 'error'), [cambios]);
  const fallidos = cambios.length - activos.length;
  const enviando = online && activos.length > 0;

  const idsEditando = useMemo(
    () => new Set(activos.filter((c) => c.tipo === 'editar').map((c) => (c.variables as { id: string }).id)),
    [activos],
  );

  const reintentarTodo = useCallback(() => {
    qc.resumePausedMutations();
  }, [qc]);
  const reintentar = useCallback((id: number) => reintentarCambio(qc, id), [qc]);
  const descartar = useCallback((id: number) => descartarCambio(qc, id), [qc]);

  const guardarEdicion = useCallback(
    (valores: ValoresNota) => {
      if (!editando) return;
      editar.mutate({ ...valores, id: editando.id, itemId: Number(editando.itemId), imgUrl: editando.imgUrl });
      mostrar(online ? 'Nota actualizada' : 'Guardado localmente, se enviará al reconectar');
      setEditando(null);
    },
    [editando, editar, online, mostrar],
  );

  const pedirEliminar = useCallback(
    (nota: NotaUsuario) => {
      Alert.alert('Eliminar nota', `¿Eliminar "${nota.titulo}"?`, [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            eliminar.mutate({ id: nota.id, itemId: Number(nota.itemId) });
            mostrar(online ? 'Nota eliminada' : 'Eliminación guardada localmente, se enviará al reconectar');
          },
        },
      ]);
    },
    [eliminar, online, mostrar],
  );

  const sincronizado = cambios.length === 0;
  const colorResumen = fallidos ? Paleta.peligro : sincronizado ? Paleta.exito : Paleta.alerta;

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      <FlatList
        data={cambios}
        keyExtractor={(c) => String(c.id)}
        contentContainerStyle={styles.lista}
        ItemSeparatorComponent={() => <View style={styles.separador} />}
        renderItem={({ item }) => (
          <ItemCambioPendiente cambio={item} online={online} onReintentar={reintentar} onDescartar={descartar} />
        )}
        ListHeaderComponent={
          <View style={styles.cabecera}>
            <ThemedText type="subtitle" style={styles.titulo}>
              Sincronización y PokeNotas
            </ThemedText>
            <EstadoConexion />

            <View
              accessibilityLiveRegion="polite"
              style={[styles.resumen, { backgroundColor: conAlfa(colorResumen, 0.15), borderColor: conAlfa(colorResumen, 0.5) }]}>
              <ThemedText type="smallBold">
                {sincronizado
                  ? '✓ Todo sincronizado'
                  : `${activos.length} ${activos.length === 1 ? 'cambio pendiente' : 'cambios pendientes'}${
                      fallidos ? ` · ${fallidos} con error` : ''
                    }`}
              </ThemedText>
              {enviando && (
                <View style={styles.sincronizando}>
                  <ActivityIndicator size="small" />
                  <ThemedText type="small">Sincronizando…</ThemedText>
                </View>
              )}
              {!online && !sincronizado && (
                <ThemedText type="small" themeColor="textSecondary">
                  Se enviarán automáticamente cuando vuelva la conexión.
                </ThemedText>
              )}
            </View>

            {online && activos.length > 0 && <Boton titulo="Reintentar ahora" onPress={reintentarTodo} />}
            {!sincronizado && (
              <ThemedText type="smallBold" style={styles.seccion}>
                Cambios pendientes
              </ThemedText>
            )}
          </View>
        }
        ListFooterComponent={
          <View style={styles.pie}>
            <ThemedText type="smallBold" style={styles.seccion}>
              Notas guardadas
            </ThemedText>
            {notas.isLoading && <ActivityIndicator />}
            {!notas.isLoading && !notas.data?.length && (
              <ThemedText type="small" themeColor="textSecondary">
                {notas.isError ? 'No se pudieron cargar las notas.' : 'Todavía no hay notas guardadas.'}
              </ThemedText>
            )}
            {notas.data?.map((nota) => (
              <TarjetaNota
                key={nota.id}
                nota={nota}
                pendiente={idsEditando.has(nota.id)}
                onEditar={setEditando}
                onEliminar={pedirEliminar}
              />
            ))}
          </View>
        }
      />

      <Modal visible={!!editando} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setEditando(null)}>
        <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top', 'bottom']}>
          {editando && (
            <FormularioNota
              titulo="Editar nota"
              inicial={editando}
              onGuardar={guardarEdicion}
              onCancelar={() => setEditando(null)}
            />
          )}
        </SafeAreaView>
      </Modal>
      <BarraMensaje mensaje={mensaje} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  lista: { padding: Spacing.three, paddingBottom: BottomTabInset + Spacing.four },
  cabecera: { gap: Spacing.three, marginBottom: Spacing.three },
  titulo: { fontSize: 28, lineHeight: 36, fontFamily: 'Rye_400Regular', fontWeight: '400' },
  resumen: { padding: Spacing.three, borderRadius: 14, borderWidth: 1, gap: Spacing.two },
  sincronizando: { flexDirection: 'row', alignItems: 'center', gap: Spacing.two },
  seccion: { marginTop: Spacing.two },
  separador: { height: Spacing.two },
  pie: { gap: Spacing.two, marginTop: Spacing.four },
});
