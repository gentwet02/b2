import { getFromApi } from '@/services/api/utils';
import type { Stats, StatsParams } from '@/types/stats';

export const statsService = {
    getStats: ({ season, player, players, band, map, hero, towers }: StatsParams) => {
        const params = new URLSearchParams();
        if (season !== undefined) params.set('season', String(season));
        if (player) params.set('player', player);
        else {
            if (players) params.set('players', players);
            if (band) params.set('band', '1');
        }
        if (map) params.set('map', map);
        if (hero) params.set('hero', hero);
        if (towers?.length) params.set('towers', towers.join(','));
        const query = params.toString();
        return getFromApi<Stats>(`stats${query ? `?${query}` : ''}`);
    },
};
