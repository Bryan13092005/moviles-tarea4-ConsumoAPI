import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Paleta, conAlfa } from '@/constants/paleta';

interface Props {
  mensaje: string | null;
}

// Barra inferior temporal de retroalimentación
export function BarraMensaje({ mensaje }: Props) {
  if (!mensaje) return null;
  return (
    <View
      accessibilityLiveRegion="polite"
      accessibilityRole="alert"
      pointerEvents="none"
      style={[styles.barra, { backgroundColor: '#1f2937', borderColor: conAlfa('#ffffff', 0.15) }]}>
      <View style={[styles.acento, { backgroundColor: Paleta.primario }]} />
      <ThemedText type="small" style={styles.texto}>
        {mensaje}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  barra: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingRight: 16,
    paddingLeft: 12,
    borderRadius: 12,
    borderWidth: 1,
    elevation: 6,
  },
  acento: { width: 4, alignSelf: 'stretch', borderRadius: 2 },
  texto: { color: '#ffffff', flex: 1 },
});
