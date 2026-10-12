import { getFromApi } from '@/services/api/utils';
import type { CompareSeason, HeadToHead } from '@/types/compare';

export const compareService = {
    /** `opponents` empty: the server picks the top 10 */
    getHeadToHead: (userId: string, opponents: string[], season?: CompareSeason) => {
        const params = new URLSearchParams();
        if (season !== undefined) params.set('season', String(season));
        if (opponents.length) params.set('with', opponents.join(','));
        const query = params.toString();
        return getFromApi<HeadToHead>(`users/${userId}/compare${query ? `?${query}` : ''}`);
    },
};
