import { keepPreviousData, useInfiniteQuery } from '@tanstack/react-query';
import { COMPARE_GAMES_PAGE_SIZE } from '@/config/compare';
import { AGGREGATE_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { compareService, type CompareParams } from '@/services/api/compare';
import type { MatchSort } from '@/types/match';

/** The games between the two sides, sorted, a page per "show more". */
export default function useCompareGames(params: CompareParams, sort: MatchSort, enabled = true) {
    return useInfiniteQuery({
        queryKey: queryKeys.compare('games', JSON.stringify(params), sort),
        queryFn: ({ pageParam }) =>
            fetchData(
                compareService.getCompareGames(params, sort, pageParam, COMPARE_GAMES_PAGE_SIZE),
                'Could not load the games',
            ),
        initialPageParam: 0,
        getNextPageParam: (last) => {
            // the server echoes the limit it applied
            const next = last.offset + last.limit;
            return next < last.total ? next : undefined;
        },
        enabled,
        placeholderData: keepPreviousData,
        staleTime: AGGREGATE_QUERY.stale,
        gcTime: AGGREGATE_QUERY.gc,
    });
}
