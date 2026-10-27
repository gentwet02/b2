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
            params.player2
                ? `vs:p:${params.player2}`
                : params.players2
                  ? `vs:${params.players2}${params.exclude2 ? `-${params.exclude2}` : ''}`
                  : 'vs:anyone',
            params.map ?? '',
            params.hero ?? '',
            [...(params.towers ?? [])].sort().join(','),
            params.exHeroes ?? '',
            params.exTowers ?? '',
            params.exMaps ?? '',
            params.overlap === false ? 'apart' : 'both',
            params.sides
                ? `sides:${params.hero2 ?? ''}|${[...(params.towers2 ?? [])].sort().join(',')}|${params.exHeroes2 ?? ''}|${params.exTowers2 ?? ''}`
                : '',
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
