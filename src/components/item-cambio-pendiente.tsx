import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { ThemedText } from '@/components/themed-text';
import { Paleta, conAlfa } from '@/constants/paleta';
import { useTheme } from '@/hooks/use-theme';
import { CambioPendiente } from '@/hooks/useCambiosPendientes';

interface Props {
  cambio: CambioPendiente;
  online: boolean;
  onReintentar: (id: number) => void;
  onDescartar: (id: number) => void;
}

const ETIQUETA_TIPO = { crear: 'Crear', editar: 'Editar', eliminar: 'Eliminar', desconocido: 'Cambio' } as const;

function describir(cambio: CambioPendiente): string {
  const v = cambio.variables as { titulo?: string; id?: string; itemId?: number } | undefined;
  if (v?.titulo) return v.titulo;
  return v?.itemId !== undefined ? `Nota del elemento #${v.itemId}` : 'Nota';
}

function ItemCambioPendienteBase({ cambio, online, onReintentar, onDescartar }: Props) {
  const theme = useTheme();
  const { color, estado } =
    cambio.estado === 'error'
      ? { color: Paleta.peligro, estado: 'Falló al enviarse' }
      : cambio.estado === 'enviando'
        ? { color: Paleta.primario, estado: 'Enviando…' }
        : { color: Paleta.alerta, estado: online ? 'Listo para enviarse' : 'En espera de conexión' };

  return (
    <View
      accessibilityLabel={`${ETIQUETA_TIPO[cambio.tipo]} nota ${describir(cambio)}: ${estado}`}
      style={[styles.item, { backgroundColor: theme.backgroundElement, borderLeftColor: color }]}>
      <View style={styles.cabecera}>
        <View style={[styles.tipo, { backgroundColor: conAlfa(color, 0.18) }]}>
          <ThemedText type="small" style={styles.textoTipo}>
            {ETIQUETA_TIPO[cambio.tipo]}
          </ThemedText>
        </View>
        <ThemedText type="small" themeColor="textSecondary">
          {estado}
        </ThemedText>
      </View>
      <ThemedText type="smallBold" numberOfLines={2}>
        {describir(cambio)}
      </ThemedText>
      {cambio.estado === 'error' && (
        <>
          {!!cambio.error && (
            <ThemedText type="small" style={{ color: Paleta.peligro }}>
              {cambio.error}
            </ThemedText>
          )}
          <View style={styles.acciones}>
            <Boton titulo="Reintentar" compacto deshabilitado={!online} onPress={() => onReintentar(cambio.id)} />
            <Boton titulo="Descartar" variante="secundario" compacto onPress={() => onDescartar(cambio.id)} />
          </View>
        </>
      )}
    </View>
  );
}

export const ItemCambioPendiente = memo(ItemCambioPendienteBase);

const styles = StyleSheet.create({
  item: { padding: 12, borderRadius: 14, borderLeftWidth: 4, gap: 6 },
  cabecera: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  tipo: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  textoTipo: { fontSize: 12, lineHeight: 18, fontWeight: '700' },
  acciones: { flexDirection: 'row', gap: 8 },
});
