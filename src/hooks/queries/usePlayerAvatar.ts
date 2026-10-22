import { useQuery } from '@tanstack/react-query';
import { AVATAR_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { loadAvatar } from '@/services/api/avatars';

/**
 * Avatar of one player, loaded only when the component using it is mounted.
 * In the leaderboard that's the rows of the page on screen, so changing page or page size
 * loads the next ones, and pages already seen come back from the cache.
 *
 * `known` (stats or an opened profile) is used as is and skips the request.
 * `ready` holds the request back until `known` had its chance (stats still loading).
 */
export default function usePlayerAvatar(id: string, known?: string, ready = true) {
    const { data } = useQuery({
        queryKey: queryKeys.avatar(id),
        queryFn: () => loadAvatar(id),
        enabled: !known && ready,
        staleTime: AVATAR_QUERY.stale,
        gcTime: AVATAR_QUERY.gc,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchInterval: (query) =>
            query.state.data?.pending && query.state.dataUpdateCount < AVATAR_QUERY.maxPolls
                ? AVATAR_QUERY.poll
                : false,
    });
    return known ?? data?.url ?? undefined;
}
