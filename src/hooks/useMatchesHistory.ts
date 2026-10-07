import { matchesService } from '@/services/api/matchesHistory';
import { toError } from '@/services/api/utils';
import type { CachedMatches } from '@/types/match';
import { useQuery } from '@tanstack/react-query';

/** Resolves to null while the server is still collecting its first batch. */
export default function useMatchesHistory() {
    return useQuery<CachedMatches | null>({
        queryKey: ['matchesHistory'],
        queryFn: async () => {
            const response = await matchesService.getMatchesRecentHistory();
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load the match history');
            }
            return response.data.matches;
        },
        staleTime: 60_000,
        refetchInterval: (query) => (query.state.data === null ? 30_000 : 5 * 60_000),
    });
}
