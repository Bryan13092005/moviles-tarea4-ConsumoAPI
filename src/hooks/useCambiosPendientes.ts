import { MutationKey, QueryClient, useMutationState } from '@tanstack/react-query';

export type TipoCambio = 'crear' | 'editar' | 'eliminar' | 'desconocido';

export interface CambioPendiente {
    id: number;
    mutationKey?: MutationKey;
    tipo: TipoCambio;
    variables: unknown;
    estado: 'pausada' | 'enviando' | 'error';
    enviadoEn: number;
    error?: string;
}

function deducirTipo(clave?: MutationKey): TipoCambio {
    const accion = clave?.[1];
    return accion === 'crear' || accion === 'editar' || accion === 'eliminar' ? accion : 'desconocido';
}

// Mutaciones pausadas (sin red), en curso o fallidas, ordenadas de la más antigua a la más reciente
export function useCambiosPendientes(): CambioPendiente[] {
    const estados = useMutationState({
        filters: {
            predicate: (m) => m.state.status === 'pending' || m.state.status === 'error',
        },
        select: (mutation): CambioPendiente => ({
            id: mutation.mutationId,
            mutationKey: mutation.options.mutationKey,
            tipo: deducirTipo(mutation.options.mutationKey),
            variables: mutation.state.variables,
            estado:
                mutation.state.status === 'error'
                    ? 'error'
                    : mutation.state.isPaused
                      ? 'pausada'
                      : 'enviando',
            enviadoEn: mutation.state.submittedAt,
            error: mutation.state.error ? String((mutation.state.error as Error).message ?? mutation.state.error) : undefined,
        }),
    });
    return [...estados].sort((a, b) => a.enviadoEn - b.enviadoEn);
}

// Vuelve a ejecutar una mutación fallida (las pausadas se reanudan con resumePausedMutations)
export function reintentarCambio(qc: QueryClient, id: number) {
    const mutacion = qc.getMutationCache().getAll().find((m) => m.mutationId === id);
    mutacion?.execute(mutacion.state.variables).catch(() => {});
}

export function descartarCambio(qc: QueryClient, id: number) {
    const mutacion = qc.getMutationCache().getAll().find((m) => m.mutationId === id);
    if (mutacion) qc.getMutationCache().remove(mutacion);
}
