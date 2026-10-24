import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Paleta, conAlfa } from '@/constants/paleta';
import { useIsOnline, useRecienReconectado } from '@/hooks/useIsOnline';

// Indicador permanente del estado de conexión
export function EstadoConexion() {
  const online = useIsOnline();
  const reconectado = useRecienReconectado();

  const { color, texto } = !online
    ? { color: Paleta.alerta, texto: 'Sin conexión · los cambios se guardarán y se enviarán al reconectar' }
    : reconectado
      ? { color: Paleta.primario, texto: 'Reconectado, sincronizando…' }
      : { color: Paleta.exito, texto: 'En línea' };

  return (
    <View
      accessibilityRole="text"
      accessibilityLiveRegion="polite"
      accessibilityLabel={`Estado de conexión: ${texto}`}
      style={[styles.contenedor, { backgroundColor: conAlfa(color, 0.15), borderColor: conAlfa(color, 0.5) }]}>
      <View style={[styles.punto, { backgroundColor: color }]} />
      <ThemedText type="smallBold" style={styles.texto}>
        {texto}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  punto: { width: 10, height: 10, borderRadius: 5 },
  texto: { flex: 1 },
});
