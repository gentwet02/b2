import { MATCHES_PAGE_SIZE, matchesService } from '@/services/api/matchesHistory';
import { toError } from '@/services/api/utils';
import type { MatchesQuery, MatchesResponse } from '@/types/match';
import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';

/** Pages of 20 stored matches, filtered and sorted by the server. */
export default function useMatchesHistory(query: MatchesQuery) {
    return useInfiniteQuery({
        queryKey: ['matchesHistory', query],
        queryFn: async ({ pageParam }): Promise<MatchesResponse> => {
            const response = await matchesService.getMatchesRecentHistory(query, pageParam);
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load the match history');
            }
            return response.data;
        },
        initialPageParam: 0,
        getNextPageParam: (last) => {
            const next = last.matches.offset + MATCHES_PAGE_SIZE;
            return next < last.matches.total ? next : undefined;
        },
        placeholderData: keepPreviousData,
        staleTime: 30_000,
        // new matches land in the database while the crawler runs
        refetchInterval: (q) => (q.state.data?.pages[0]?.crawl?.isFetching ? 30_000 : 5 * 60_000),
    });
}
