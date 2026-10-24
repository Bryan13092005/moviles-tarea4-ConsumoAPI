//importar cliente y tipo carro
import { clientPokemon, userClient } from "./client";
import {Pokemon, NotaUsuario, NuevaNota, EdicionNota} from '@/types/index';
import { log } from '@/utils/log';

//servicio carrosService, para centralizar las operaciones de la entidad carro retornando una promesa con un arreglo de objetos
//poner metodos async para interactual con la API

export const pokemonService = {
  getAll: async (): Promise<Pokemon[]> => {
    log('GET', 'PokeAPI ejecutado (red)');
    // 1. Obtener la lista de los 20 Pokémon
    // al hacer esta peticion solo se listan los 20 primeros pokemones con el nombre y url de la informacion detallada
    const { data } = await clientPokemon.get<{ results: { name: string; url: string }[] }>('?limit=20');

    // 2. Consultar el detalle de cada Pokémon en paralelo para obtener id, imagen, experiencia y altura
    const peticionesDetalle = data.results.map((pokemon) =>
      clientPokemon.get<any>(pokemon.url)
    );

    const respuestasDetalles = await Promise.all(peticionesDetalle);

    // 3. Mapear la respuesta de cada pokemon a la estructura de la interfaz Pokemon
    const listaPokemon: Pokemon[] = respuestasDetalles.map(({ data: detalle }) => ({
      id: detalle.id,
      nombre: detalle.name.toUpperCase(),
      experiencia: detalle.base_experience,
      altura: detalle.height,
      imagen:
        detalle.sprites.other?.['home']?.front_shiny ||
        detalle.sprites.front_shiny,
    }));

    log('GET', `PokeAPI OK: ${listaPokemon.length} elementos`);
    return listaPokemon;
  },
};

export const userService={
    getAll: async():Promise<NotaUsuario[]>=>{
        log('GET', 'MockAPI ejecutado (red)')
        const {data}=await userClient.get<NotaUsuario[]>('datosUsuario')
        log('GET', `MockAPI OK: ${data.length} notas`)
        return data
    },

    getById: async(id:string):Promise<NotaUsuario>=>{
        const {data}=await userClient.get<NotaUsuario>(`datosUsuario/${id}`)
        return data
    },

    getByItemId: async(itemId:number):Promise<NotaUsuario[]>=>{
        const {data}=await userClient.get<NotaUsuario[]>('datosUsuario',{params:{itemId}})
        return data
    },

    add: async(nota:NuevaNota):Promise<NotaUsuario>=>{
        const {data}=await userClient.post<NotaUsuario>('datosUsuario',nota)
        return data
    },

    delete: async(id:string):Promise<void>=>{
        await userClient.delete(`datosUsuario/${id}`)
    },

    update: async({id, ...cambios}:EdicionNota):Promise<NotaUsuario>=>{
        const {data}=await userClient.put<NotaUsuario>(`datosUsuario/${id}`,cambios)
        return data
    }
}