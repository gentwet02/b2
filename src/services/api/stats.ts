import { getFromApi, withQuery } from '@/services/api/client';
import type { Stats, StatsParams } from '@/types/stats';

export const statsService = {
    getStats: ({
        season,
        overlap,
        player,
        players,
        exclude,
        player2,
        players2,
        exclude2,
        map,
        hero,
        towers,
        hero2,
        towers2,
        exHeroes2,
        exTowers2,
        sides,
        ...excluded
    }: StatsParams) =>
        getFromApi<Stats>(
            withQuery('stats', {
                season,
                overlap: overlap === false ? 0 : undefined,
                ...(player ? { player } : { players, exclude }),
                ...(player2 ? { player2 } : { players2, exclude2: players2 ? exclude2 : undefined }),
                map,
                hero,
                towers: towers?.join(','),
                ...excluded,
                ...(sides && {
                    sides: true,
                    hero2,
                    towers2: towers2?.join(','),
                    exHeroes2,
                    exTowers2,
                }),
            }),
        ),
};
