import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Paleta } from '@/constants/paleta';
import { useTheme } from '@/hooks/use-theme';

interface Props {
  titulo: string;
  onPress: () => void;
  variante?: 'primario' | 'secundario' | 'peligro';
  deshabilitado?: boolean;
  pista?: string;
  compacto?: boolean;
}

export function Boton({ titulo, onPress, variante = 'primario', deshabilitado, pista, compacto }: Props) {
  const theme = useTheme();
  const relleno = variante === 'primario' ? Paleta.primario : variante === 'peligro' ? Paleta.peligro : theme.backgroundSelected;
  const colorTexto = variante === 'secundario' ? theme.text : '#ffffff';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={titulo}
      accessibilityHint={pista}
      accessibilityState={{ disabled: !!deshabilitado }}
      disabled={deshabilitado}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        compacto && styles.compacto,
        variante === 'primario' && styles.primario,
        variante === 'secundario' && { borderColor: theme.border },
        { backgroundColor: relleno, opacity: deshabilitado ? 0.4 : pressed ? 0.85 : 1 },
      ]}>
      <ThemedText type="smallBold" style={{ color: colorTexto }}>
        {titulo}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 9999,
    borderWidth: 1,
    borderColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primario: {
    shadowColor: '#2A75BB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  compacto: { paddingHorizontal: 16, paddingVertical: 8 },
});
