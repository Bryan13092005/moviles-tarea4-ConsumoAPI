import { useCallback, useEffect, useRef, useState } from 'react';

// Mensaje temporal de retroalimentación (toast simple)
export function useMensaje(duracion = 3000) {
  const [mensaje, setMensaje] = useState<string | null>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  const mostrar = useCallback(
    (texto: string) => {
      if (temporizador.current) clearTimeout(temporizador.current);
      setMensaje(texto);
      temporizador.current = setTimeout(() => setMensaje(null), duracion);
    },
    [duracion],
  );

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    [],
  );

  return { mensaje, mostrar };
}
