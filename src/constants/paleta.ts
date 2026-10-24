// Colores semánticos de estado, válidos en modo claro y oscuro
export const Paleta = {
  primario: '#3c87f7',
  exito: '#2E9E5B',
  alerta: '#D98A00',
  peligro: '#D64545',
} as const;

// Agrega transparencia a un color hexadecimal de 6 dígitos
export const conAlfa = (color: string, alfa: number) =>
  `${color}${Math.round(alfa * 255).toString(16).padStart(2, '0')}`;
