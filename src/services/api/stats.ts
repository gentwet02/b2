import { getFromApi, withQuery } from '@/services/api/client';
import type { Stats, StatsParams } from '@/types/stats';

export const statsService = {
    getStats: ({ season, player, players, exclude, map, hero, towers }: StatsParams) =>
        getFromApi<Stats>(
            withQuery('stats', {
                season,
                ...(player ? { player } : { players, exclude }),
                map,
                hero,
                towers: towers?.join(','),
            }),
        ),
};
