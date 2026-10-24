// Registra un mensaje con hora local (HH:mm:ss.SSS) para la demostración; sale también en el APK
export const log = (etiqueta: string, mensaje: string) => {
  const ahora = new Date();
  const dos = (n: number) => String(n).padStart(2, '0');
  const hora = `${dos(ahora.getHours())}:${dos(ahora.getMinutes())}:${dos(ahora.getSeconds())}.${String(
    ahora.getMilliseconds(),
  ).padStart(3, '0')}`;
  console.log(`[${hora}] [${etiqueta}] ${mensaje}`);
};
