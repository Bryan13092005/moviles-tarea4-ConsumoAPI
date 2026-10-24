import { onlineManager } from '@tanstack/react-query';
import { useEffect, useState, useSyncExternalStore } from 'react';

const suscribir = (callback: () => void) => onlineManager.subscribe(callback);
const obtener = () => onlineManager.isOnline();

export function useIsOnline(): boolean {
  return useSyncExternalStore(suscribir, obtener, () => true);
}

// true durante unos segundos después de recuperar la conexión
export function useRecienReconectado(duracion = 3000): boolean {
  const [reconectado, setReconectado] = useState(false);

  useEffect(() => {
    let previo = onlineManager.isOnline();
    let temporizador: ReturnType<typeof setTimeout> | undefined;
    const cancelar = onlineManager.subscribe((online) => {
      if (temporizador) clearTimeout(temporizador);
      if (online && !previo) {
        setReconectado(true);
        temporizador = setTimeout(() => setReconectado(false), duracion);
      } else if (!online) {
        setReconectado(false);
      }
      previo = online;
    });
    return () => {
      cancelar();
      if (temporizador) clearTimeout(temporizador);
    };
  }, [duracion]);

  return reconectado;
}
