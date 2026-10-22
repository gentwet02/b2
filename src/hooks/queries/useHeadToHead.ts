import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { AGGREGATE_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { compareService } from '@/services/api/compare';
import type { SeasonScope } from '@/types/season';

export const headToHeadQueryOptions = (userId: string, opponents: string[], season?: SeasonScope) =>
    queryOptions({
        // slot order doesn't change the answer: one cache entry per set of opponents
        queryKey: queryKeys.headToHead(
            userId,
            season ?? 'live',
            opponents.length ? [...opponents].sort().join(',') : 'top',
        ),
        queryFn: () =>
            fetchData(
                compareService.getHeadToHead(userId, opponents, season),
                'Could not load the head to head',
            ),
        // the server caches 5 minutes too; a set of opponents seen once comes back instantly
        staleTime: AGGREGATE_QUERY.stale,
        gcTime: AGGREGATE_QUERY.gc,
    });

/** The profile player's games against each opponent. */
export default function useHeadToHead(
    userId: string,
    opponents: string[],
    season?: SeasonScope,
    enabled = true,
) {
    return useQuery({
        ...headToHeadQueryOptions(userId, opponents, season),
        enabled: !!userId && enabled,
        // swapping one opponent keeps the nine others on screen while it loads
        placeholderData: keepPreviousData,
    });
}
