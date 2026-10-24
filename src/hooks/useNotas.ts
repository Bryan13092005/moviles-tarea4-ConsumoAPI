import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/api/pokemon.service';
import { clavesConsulta, clavesMutacion } from '@/config/queryKeys';
import { useLogCache } from '@/hooks/useLogCache';
import { EdicionNota, EliminacionNota, NotaUsuario, NuevaNota } from '@/types/index';

export function useNotas() {
    const consulta = useQuery({
        queryKey: clavesConsulta.notasUsuario.lista(),
        queryFn: () => userService.getAll(),
    });
    useLogCache(consulta.data?.length, consulta.isFetching, 'notas');
    return consulta;
}

export function useNota(id: string) {
    return useQuery({
        queryKey: clavesConsulta.notasUsuario.detalle(id),
        queryFn: () => userService.getById(id),
        enabled: !!id,
    });
}

export function useNotasPorElemento(itemId: number) {
    return useQuery({
        queryKey: clavesConsulta.notasUsuario.porElemento(itemId),
        queryFn: () => userService.getByItemId(itemId),
    });
}

// La mutationFn y onMutate/onError se registran en queryClient.ts (setMutationDefaults)
export function useCrearNota() {
    const qc = useQueryClient();
    return useMutation<NotaUsuario, Error, NuevaNota>({
        mutationKey: clavesMutacion.crearNota,
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.lista() });
            qc.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.porElemento(variables.itemId) });
        },
    });
}

export function useEditarNota() {
    const qc = useQueryClient();
    return useMutation<NotaUsuario, Error, EdicionNota>({
        mutationKey: clavesMutacion.editarNota,
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.detalle(variables.id) });
            qc.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.lista() });
            qc.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.porElemento(variables.itemId) });
        },
    });
}

export function useEliminarNota() {
    const qc = useQueryClient();
    return useMutation<void, Error, EliminacionNota>({
        mutationKey: clavesMutacion.eliminarNota,
        onSettled: (_data, _error, variables) => {
            qc.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.lista() });
            qc.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.porElemento(variables.itemId) });
            qc.invalidateQueries({ queryKey: clavesConsulta.notasUsuario.detalle(variables.id) });
        },
    });
}
