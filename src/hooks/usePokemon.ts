import { useQuery } from '@tanstack/react-query';
import { pokemonService } from '@/api/pokemon.service';
import { clavesConsulta } from '@/config/queryKeys';
import { useLogCache } from '@/hooks/useLogCache';

// staleTime y gcTime provienen de setQueryDefaults en queryClient.ts
export function usePokemon() {
    const consulta = useQuery({
        queryKey: clavesConsulta.catalogoPublico.lista(),
        queryFn: () => pokemonService.getAll(),
    });
    useLogCache(consulta.data?.length, consulta.isFetching, 'elementos');
    return consulta;
}
