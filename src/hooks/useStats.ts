import { statsService } from '@/services/api/stats';
import { toError } from '@/services/api/utils';
import type { Stats, StatsParams } from '@/types/stats';
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

export const statsQueryOptions = (params: StatsParams) =>
    queryOptions<Stats>({
        queryKey: [
            'stats',
            params.season ?? 'live',
            params.player ? `p:${params.player}` : `${params.players}${params.band ? ':band' : ''}`,
            params.map ?? '',
            params.hero ?? '',
            [...(params.towers ?? [])].sort().join(','),
        ],
        queryFn: async () => {
            const response = await statsService.getStats(params);
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load the stats');
            }
            return response.data;
        },
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
    });

/** Hero, tower, strat and map usage and win rates of a group of players. */
export default function useStats(params: StatsParams, enabled = true) {
    return useQuery({
        ...statsQueryOptions(params),
        enabled,
        placeholderData: keepPreviousData,
    });
}
