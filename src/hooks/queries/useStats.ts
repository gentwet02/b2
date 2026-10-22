import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { AGGREGATE_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { statsService } from '@/services/api/stats';
import type { StatsParams } from '@/types/stats';

export const statsQueryOptions = (params: StatsParams) =>
    queryOptions({
        queryKey: queryKeys.stats(
            params.season ?? 'live',
            params.player ? `p:${params.player}` : `${params.players}${params.exclude ? `-${params.exclude}` : ''}`,
            params.map ?? '',
            params.hero ?? '',
            [...(params.towers ?? [])].sort().join(','),
        ),
        queryFn: () => fetchData(statsService.getStats(params), 'Could not load the stats'),
        staleTime: AGGREGATE_QUERY.stale,
        gcTime: AGGREGATE_QUERY.gc,
    });

/** Hero, tower, strat and map usage and win rates of a group of players. */
export default function useStats(params: StatsParams, enabled = true) {
    return useQuery({
        ...statsQueryOptions(params),
        enabled,
        placeholderData: keepPreviousData,
    });
}
