import { Image } from 'expo-image';
import { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Boton } from '@/components/boton';
import { InsigniaPendiente } from '@/components/insignia-pendiente';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { NotaUsuario } from '@/types/index';

interface Props {
  nota: NotaUsuario;
  pendiente?: boolean;
  soloLectura?: boolean;
  onEditar?: (nota: NotaUsuario) => void;
  onEliminar?: (nota: NotaUsuario) => void;
}

function TarjetaNotaBase({ nota, pendiente, soloLectura, onEditar, onEliminar }: Props) {
  const theme = useTheme();
  const sinSincronizar = nota.id.startsWith('temp-');
  const marcada = pendiente || nota.isPending || sinSincronizar;
  const tieneImagen = /^https?:\/\//.test(nota.imgUrl ?? '');

  return (
    <View style={[styles.tarjeta, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <View style={styles.fila}>
        {tieneImagen && <Image source={{ uri: nota.imgUrl }} style={styles.imagen} contentFit="cover" />}
        <View style={styles.texto}>
          <ThemedText type="smallBold" numberOfLines={2}>
            {nota.titulo}
          </ThemedText>
          <ThemedText type="small" numberOfLines={3}>
            {nota.contenido}
          </ThemedText>
        </View>
      </View>
      {marcada && <InsigniaPendiente />}
      {!soloLectura && (
        <>
          <View style={styles.acciones}>
            <Boton titulo="Editar" variante="secundario" compacto deshabilitado={sinSincronizar} onPress={() => onEditar?.(nota)} />
            <Boton titulo="Eliminar" variante="peligro" compacto deshabilitado={sinSincronizar} onPress={() => onEliminar?.(nota)} />
          </View>
          {sinSincronizar && (
            <ThemedText type="small" themeColor="textSecondary">
              Podrás editarla o eliminarla cuando se sincronice con el servidor.
            </ThemedText>
          )}
        </>
      )}
    </View>
  );
}

export const TarjetaNota = memo(TarjetaNotaBase);

const styles = StyleSheet.create({
  tarjeta: { padding: 12, borderRadius: 16, borderWidth: 1, gap: 8 },
  fila: { flexDirection: 'row', gap: 12 },
  imagen: { width: 64, height: 64, borderRadius: 12 },
  texto: { flex: 1, gap: 2 },
  acciones: { flexDirection: 'row', gap: 8 },
});
