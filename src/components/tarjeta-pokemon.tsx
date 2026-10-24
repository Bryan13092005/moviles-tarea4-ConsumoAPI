import { Image } from 'expo-image';
import { memo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Paleta, conAlfa } from '@/constants/paleta';
import { useTheme } from '@/hooks/use-theme';
import { Pokemon } from '@/types/index';

interface Props {
  pokemon: Pokemon;
  cantidadNotas: number;
  onPress: (pokemon: Pokemon) => void;
}

function TarjetaPokemonBase({ pokemon, cantidadNotas, onPress }: Props) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${pokemon.nombre}, ${cantidadNotas} notas`}
      accessibilityHint="Abre las notas de este Pokémon"
      onPress={() => onPress(pokemon)}
      style={({ pressed }) => [
        styles.tarjeta,
        { backgroundColor: theme.backgroundElement, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.fondoImagen, { backgroundColor: theme.surfaceMuted }]}>
        <Image source={{ uri: pokemon.imagen }} style={styles.imagen} contentFit="contain" transition={200} />
      </View>
      <ThemedText type="smallBold" style={styles.nombre} numberOfLines={1}>
        {pokemon.nombre}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        XP {pokemon.experiencia} · Alt. {pokemon.altura}
      </ThemedText>
      <View style={[styles.contador, { backgroundColor: conAlfa(Paleta.secundario, cantidadNotas ? 0.5 : 0.25) }]}>
        <ThemedText type="small" style={styles.textoContador}>
          📝 {cantidadNotas === 1 ? '1 nota' : `${cantidadNotas} notas`}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export const TarjetaPokemon = memo(TarjetaPokemonBase);

const styles = StyleSheet.create({
  tarjeta: {
    flex: 1,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
    minHeight: 44,
    overflow: 'hidden',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  fondoImagen: { height: 112, alignItems: 'center', justifyContent: 'center', borderRadius: 12, marginBottom: 4 },
  imagen: { width: '100%', height: 96 },
  nombre: { fontSize: 16, lineHeight: 22 },
  contador: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, marginTop: 4 },
  textoContador: { fontSize: 12, lineHeight: 18, fontWeight: '700', color: '#1E293B' },
});
