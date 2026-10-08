import { loadAvatar, type AvatarResult } from '@/services/api/avatars';
import { useQuery } from '@tanstack/react-query';

/** How often a row asks again while the server is fetching its profile. */
const POLL_MS = 4_000;
/** Give up (show the initial) after this many answers still pending: about a minute. */
const MAX_POLLS = 15;

/**
 * Avatar of one player, loaded only when the component using it is mounted.
 * In the leaderboard that's the rows of the page on screen, so changing page or page size
 * loads the next ones, and pages already seen come back from the cache.
 *
 * `known` (stats or an opened profile) is used as is and skips the request.
 * `ready` holds the request back until `known` had its chance (stats still loading).
 */
export default function usePlayerAvatar(id: string, known?: string, ready = true) {
    const { data } = useQuery<AvatarResult>({
        queryKey: ['avatar', id],
        queryFn: () => loadAvatar(id),
        enabled: !known && ready,
        staleTime: 30 * 60_000,
        gcTime: 30 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
        refetchInterval: (query) =>
            query.state.data?.pending && query.state.dataUpdateCount < MAX_POLLS ? POLL_MS : false,
    });
    return known ?? data?.url ?? undefined;
}
