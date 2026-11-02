import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { hashKey, matchQuery, useQueryClient, type QueryKey } from '@tanstack/react-query';

/**
 * The data of every cached query under `prefix`, like queryClient.getQueriesData, but the
 * component renders again when one of them gets new data or leaves the cache. Never fetches:
 * it only reads what other parts of the app loaded.
 */
export default function useCachedQueriesData<T>(prefix: QueryKey) {
    const queryClient = useQueryClient();
    const cache = queryClient.getQueryCache();
    // the same prefix from one render to the next, whatever array the caller made
    const hash = hashKey(prefix);
    const filters = useMemo(() => ({ queryKey: JSON.parse(hash) as QueryKey }), [hash]);

    // bumped on every change that matters to `filters`: what useSyncExternalStore compares
    const version = useRef(0);
    const subscribe = useCallback(
        (onChange: () => void) =>
            cache.subscribe((event) => {
                const changed =
                    event.type === 'removed' ||
                    (event.type === 'updated' && event.action.type === 'success');
                if (!changed || !matchQuery(filters, event.query)) return;
                version.current += 1;
                onChange();
            }),
        [cache, filters],
    );
    const current = useSyncExternalStore(subscribe, () => version.current);

    return useMemo(
        () => queryClient.getQueriesData<T>(filters),
        // `current` is the cache's change count: read again when it moves
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [queryClient, filters, current],
    );
}
