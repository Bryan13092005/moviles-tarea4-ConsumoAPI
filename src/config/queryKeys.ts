// Árbol jerárquico de claves de consulta para gestionar la caché de TanStack Query
export const clavesConsulta = {
  // Claves para la API pública de solo lectura
  catalogoPublico: {
    todas: ['catalogoPublico'] as const,
    lista: () => [...clavesConsulta.catalogoPublico.todas, 'lista'] as const,
    detalle: (id: number) => [...clavesConsulta.catalogoPublico.todas, 'detalle', id] as const,
  },
  // Claves para las notas personales guardadas en MockAPI
  notasUsuario: {
    todas: ['notasUsuario'] as const,
    lista: () => [...clavesConsulta.notasUsuario.todas, 'lista'] as const,
    detalle: (id: string) => [...clavesConsulta.notasUsuario.todas, 'detalle', id] as const,
    porElemento: (idElemento: number) => [...clavesConsulta.notasUsuario.todas, 'porElemento', idElemento] as const,
  },
};

// Claves de mutación: permiten a setMutationDefaults encontrar la mutationFn tras reiniciar la app
export const clavesMutacion = {
  crearNota: ['notasUsuario', 'crear'] as const,
  editarNota: ['notasUsuario', 'editar'] as const,
  eliminarNota: ['notasUsuario', 'eliminar'] as const,
};