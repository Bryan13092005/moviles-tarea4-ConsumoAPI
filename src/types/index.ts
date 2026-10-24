// Define las estructuras de datos para la API pública y MockAPI

// Estructura de un elemento del catálogo público (PokeAPI)
export interface Pokemon {
  id: number;
  nombre: string;
  experiencia: number;
  altura: number;
  imagen: string;
}

// Estructura de las notas/favoritos guardados en MockAPI por el usuario
export interface NotaUsuario {
  id: string; // MockAPI asigna IDs tipo string
  itemId: number; // Relación con el ID del elemento del catálogo público
  titulo: string;
  contenido: string;
  createdAt: number; // MockAPI devuelve un timestamp Unix en segundos
  isPending?: boolean; // Flag local para identificar cambios pendientes de sincronización
  imgUrl: string;
}

// Variables de las mutaciones de notas
export interface NuevaNota {
  itemId: number;
  titulo: string;
  contenido: string;
  imgUrl: string; // imagen del Pokémon (PokeAPI)
}

export interface EdicionNota extends NuevaNota {
  id: string;
}

export interface EliminacionNota {
  id: string;
  itemId: number;
}