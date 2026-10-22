import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { MATCHES_PAGE_SIZE } from '@/config/match';
import { MATCHES_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { matchesService } from '@/services/api/matchesHistory';
import type { MatchesQuery } from '@/types/match';

/** Pages of stored matches, filtered and sorted by the server. */
export default function useMatchesHistory(query: MatchesQuery, pageSize = MATCHES_PAGE_SIZE) {
    return useInfiniteQuery({
        // the profile's refresh invalidates ['matchesHistory', { playerId }]: still a prefix match
        queryKey: queryKeys.matchesHistory(query, pageSize),
        queryFn: ({ pageParam }) =>
            fetchData(
                matchesService.getMatchesRecentHistory(query, pageParam, pageSize),
                'Could not load the match history',
            ),
        initialPageParam: 0,
        getNextPageParam: (last) => {
            // the server echoes the limit it applied (it clamps to 50)
            const next = last.matches.offset + last.matches.limit;
            return next < last.matches.total ? next : undefined;
        },
        placeholderData: keepPreviousData,
        staleTime: MATCHES_QUERY.stale,
        refetchInterval: (q) =>
            q.state.data?.pages[0]?.crawl?.isFetching
                ? MATCHES_QUERY.pollWhileCrawling
                : MATCHES_QUERY.poll,
    });
}
