import { MATCHES_PAGE_SIZE, matchesService } from '@/services/api/matchesHistory';
import { toError } from '@/services/api/utils';
import type { MatchesQuery, MatchesResponse } from '@/types/match';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

/** Pages of stored matches (20 by default), filtered and sorted by the server. */
export default function useMatchesHistory(query: MatchesQuery, pageSize = MATCHES_PAGE_SIZE) {
    return useInfiniteQuery({
        // the profile's refresh invalidates ['matchesHistory', { playerId }]: still a prefix match
        queryKey: ['matchesHistory', query, pageSize],
        queryFn: async ({ pageParam }): Promise<MatchesResponse> => {
            const response = await matchesService.getMatchesRecentHistory(
                query,
                pageParam,
                pageSize,
            );
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load the match history');
            }
            return response.data;
        },
        initialPageParam: 0,
        getNextPageParam: (last) => {
            // the server echoes the limit it applied (it clamps to 50)
            const next = last.matches.offset + last.matches.limit;
            return next < last.matches.total ? next : undefined;
        },
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        // new matches land in the database while the crawler runs
        refetchInterval: (q) => (q.state.data?.pages[0]?.crawl?.isFetching ? 30_000 : 5 * 60_000),
    });
}
