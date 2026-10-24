import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Paleta, conAlfa } from '@/constants/paleta';

export function InsigniaPendiente({ texto = 'Pendiente de sincronizar' }: { texto?: string }) {
  return (
    <View
      accessibilityLabel={texto}
      style={[styles.insignia, { backgroundColor: conAlfa(Paleta.alerta, 0.18), borderColor: conAlfa(Paleta.alerta, 0.6) }]}>
      <ThemedText type="small" style={styles.texto}>
        ⏳ {texto}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  insignia: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  texto: { fontSize: 12, lineHeight: 18 },
});
