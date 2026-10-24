import { useEffect, useRef } from 'react';

import { log } from '@/utils/log';

// Registra una sola vez por consulta cuando se muestran datos en caché mientras el GET sigue en curso
export function useLogCache(cantidad: number | undefined, isFetching: boolean, unidad: string) {
    const previo = useRef(false);

    useEffect(() => {
        if (isFetching && !previo.current && cantidad !== undefined) {
            log('CACHÉ', `Mostrando ${cantidad} ${unidad} desde caché (GET en curso)`);
        }
        previo.current = isFetching;
    }, [cantidad, isFetching, unidad]);
}
