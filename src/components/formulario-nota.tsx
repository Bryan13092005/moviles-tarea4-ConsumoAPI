import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { Boton } from '@/components/boton';
import { ThemedText } from '@/components/themed-text';
import { Paleta } from '@/constants/paleta';
import { useTheme } from '@/hooks/use-theme';
import { useIsOnline } from '@/hooks/useIsOnline';

export interface ValoresNota {
  titulo: string;
  contenido: string;
}

interface Props {
  titulo: string;
  inicial?: Partial<ValoresNota>;
  onGuardar: (valores: ValoresNota) => void;
  onCancelar: () => void;
}

export function FormularioNota({ titulo, inicial, onGuardar, onCancelar }: Props) {
  const theme = useTheme();
  const online = useIsOnline();
  const [valores, setValores] = useState<ValoresNota>({
    titulo: inicial?.titulo ?? '',
    contenido: inicial?.contenido ?? '',
  });
  const [intentado, setIntentado] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const errores = {
    titulo: valores.titulo.trim() ? '' : 'El título es obligatorio',
    contenido: valores.contenido.trim() ? '' : 'El contenido es obligatorio',
  };

  const cambiar = (campo: keyof ValoresNota) => (texto: string) => setValores((v) => ({ ...v, [campo]: texto }));

  const guardar = () => {
    setIntentado(true);
    if (errores.titulo || errores.contenido) return;
    setEnviado(true);
    onGuardar({
      titulo: valores.titulo.trim(),
      contenido: valores.contenido.trim(),
    });
  };

  const estiloInput = [
    styles.input,
    { backgroundColor: theme.surfaceMuted, color: theme.text, borderColor: theme.border },
  ];

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.contenido} keyboardShouldPersistTaps="handled">
        <ThemedText type="subtitle" style={styles.encabezado}>
          {titulo}
        </ThemedText>
        {!online && (
          <ThemedText type="small" themeColor="textSecondary">
            Sin conexión: se guardará localmente y se enviará al reconectar.
          </ThemedText>
        )}

        <Campo etiqueta="Título" error={intentado ? errores.titulo : ''}>
          <TextInput
            style={estiloInput}
            value={valores.titulo}
            onChangeText={cambiar('titulo')}
            placeholder="Ej. Mi favorito"
            placeholderTextColor={theme.textSecondary}
            accessibilityLabel="Título de la nota"
          />
        </Campo>
        <Campo etiqueta="Contenido" error={intentado ? errores.contenido : ''}>
          <TextInput
            style={[...estiloInput, styles.multilinea]}
            value={valores.contenido}
            onChangeText={cambiar('contenido')}
            placeholder="Escribe tu nota"
            placeholderTextColor={theme.textSecondary}
            multiline
            accessibilityLabel="Contenido de la nota"
          />
        </Campo>

        <View style={styles.acciones}>
          <Boton titulo="Cancelar" variante="secundario" onPress={onCancelar} deshabilitado={enviado} />
          <Boton titulo="Guardar" onPress={guardar} deshabilitado={enviado} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Campo({ etiqueta, error, children }: { etiqueta: string; error?: string; children: React.ReactNode }) {
  return (
    <View style={styles.campo}>
      <ThemedText type="smallBold">{etiqueta}</ThemedText>
      {children}
      {!!error && (
        <ThemedText type="small" style={{ color: Paleta.peligro }} accessibilityLiveRegion="polite">
          {error}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  contenido: { padding: 16, gap: 12 },
  encabezado: { fontSize: 26, lineHeight: 34 },
  campo: { gap: 4 },
  input: {
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  multilinea: { minHeight: 100, textAlignVertical: 'top' },
  acciones: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 8 },
});
