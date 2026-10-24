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
      style={({ pressed }) => [styles.tarjeta, { backgroundColor: theme.backgroundElement, opacity: pressed ? 0.85 : 1 }]}>
      <Image source={{ uri: pokemon.imagen }} style={styles.imagen} contentFit="contain" transition={200} />
      <ThemedText type="smallBold" numberOfLines={1}>
        {pokemon.nombre}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        XP {pokemon.experiencia} · Alt. {pokemon.altura}
      </ThemedText>
      <View style={[styles.contador, { backgroundColor: conAlfa(Paleta.primario, cantidadNotas ? 0.2 : 0.08) }]}>
        <ThemedText type="small" style={styles.textoContador}>
          📝 {cantidadNotas === 1 ? '1 nota' : `${cantidadNotas} notas`}
        </ThemedText>
      </View>
    </Pressable>
  );
}

export const TarjetaPokemon = memo(TarjetaPokemonBase);

const styles = StyleSheet.create({
  tarjeta: { flex: 1, padding: 12, borderRadius: 16, gap: 4, minHeight: 44 },
  imagen: { width: '100%', height: 96, marginBottom: 4 },
  contador: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, marginTop: 4 },
  textoContador: { fontSize: 12, lineHeight: 18 },
});
