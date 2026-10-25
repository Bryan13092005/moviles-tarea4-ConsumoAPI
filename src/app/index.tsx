import { useCallback, useMemo, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Boton } from '@/components/boton';
import { EstadoConexion } from '@/components/estado-conexion';
import { Esqueleto } from '@/components/esqueleto';
import { PanelNotas } from '@/components/panel-notas';
import { TarjetaPokemon } from '@/components/tarjeta-pokemon';
import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useNotas } from '@/hooks/useNotas';
import { usePokemon } from '@/hooks/usePokemon';
import { Pokemon } from '@/types/index';
import { useFonts, Rye_400Regular } from '@expo-google-fonts/rye';

export default function Catalogo() {
  const [fontsLoaded] = useFonts({ Rye_400Regular });
  const theme = useTheme();
  const pokemon = usePokemon();
  const notas = useNotas();
  const [seleccionado, setSeleccionado] = useState<Pokemon | null>(null);

  const conteo = useMemo(() => {
    const mapa = new Map<number, number>();
    notas.data?.forEach((n) => mapa.set(Number(n.itemId), (mapa.get(Number(n.itemId)) ?? 0) + 1));
    return mapa;
  }, [notas.data]);

  const abrir = useCallback((p: Pokemon) => setSeleccionado(p), []);
  const cerrar = useCallback(() => setSeleccionado(null), []);
  const refrescar = useCallback(() => {
    pokemon.refetch();
    notas.refetch();
  }, [pokemon, notas]);

  const hayDatos = !!pokemon.data;

    if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={styles.cabecera}>
        <ThemedText type="subtitle" style={styles.titulo}>
          Catálogo Pokemones
        </ThemedText>
        <EstadoConexion />
        {hayDatos && pokemon.isFetching && (
          <ThemedText type="small" themeColor="textSecondary" accessibilityLiveRegion="polite">
            Actualizando…
          </ThemedText>
        )}
        {hayDatos && pokemon.isError && (
          <ThemedText type="small" themeColor="textSecondary">
            Mostrando datos guardados
          </ThemedText>
        )}
      </View>

      {pokemon.isLoading ? (
        <View style={styles.grilla}>
          {Array.from({ length: 6 }, (_, i) => (
            <Esqueleto key={i} alto={170} style={styles.esqueleto} />
          ))}
        </View>
      ) : (
        <FlatList
          data={pokemon.data ?? []}
          keyExtractor={(p) => String(p.id)}
          numColumns={2}
          columnWrapperStyle={styles.fila}
          contentContainerStyle={styles.lista}
          refreshControl={<RefreshControl refreshing={pokemon.isRefetching} onRefresh={refrescar} />}
          renderItem={({ item }) => (
            <TarjetaPokemon pokemon={item} cantidadNotas={conteo.get(item.id) ?? 0} onPress={abrir} />
          )}
          ListEmptyComponent={
            <View style={styles.vacio}>
              <ThemedText type="smallBold">
                {pokemon.isError ? 'No se pudo cargar el catálogo' : 'Sin conexión y sin datos guardados'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                Conéctate a internet para descargar el catálogo.
              </ThemedText>
              <Boton titulo="Reintentar" onPress={() => pokemon.refetch()} />
            </View>
          }
        />
      )}

      <PanelNotas pokemon={seleccionado} onCerrar={cerrar} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cabecera: { padding: Spacing.three, gap: Spacing.two },
  titulo: { fontSize: 28, lineHeight: 36, fontFamily: 'Rye_400Regular', fontWeight: '400' },
  lista: { paddingHorizontal: Spacing.three, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  fila: { gap: Spacing.three },
  grilla: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.three, paddingHorizontal: Spacing.three },
  esqueleto: { width: '47%', borderRadius: 16 },
  vacio: { alignItems: 'center', gap: Spacing.two, paddingVertical: Spacing.five },
});
