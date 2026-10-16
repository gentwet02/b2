import { getFromApi } from '@/services/api/utils';
import type { CompareSeason, HeadToHead, OpponentsMet, Versus } from '@/types/compare';

export const compareService = {
    /** `opponents` empty: the server picks the top 10 */
    getHeadToHead: (userId: string, opponents: string[], season?: CompareSeason) => {
        const params = new URLSearchParams();
        if (season !== undefined) params.set('season', String(season));
        if (opponents.length) params.set('with', opponents.join(','));
        const query = params.toString();
        return getFromApi<HeadToHead>(`users/${userId}/compare${query ? `?${query}` : ''}`);
    },
    getVersus: (
        userId: string,
        {
            season,
            vs,
            range,
            band,
        }: {
            season?: CompareSeason | undefined;
            vs?: string | undefined;
            range?: string | undefined;
            band?: boolean | undefined;
        },
    ) => {
        const params = new URLSearchParams();
        if (season !== undefined) params.set('season', String(season));
        if (vs) params.set('vs', vs);
        else {
            if (range) params.set('range', range);
            if (band) params.set('band', '1');
        }
        const query = params.toString();
        return getFromApi<Versus>(`users/${userId}/versus${query ? `?${query}` : ''}`);
    },
    getOpponents: (userId: string, season?: CompareSeason) =>
        getFromApi<OpponentsMet>(
            `users/${userId}/opponents${season !== undefined ? `?season=${season}` : ''}`,
        ),
};
