import { getFromApi, withQuery } from '@/services/api/client';
import type { HeadToHead, OpponentsMet, Versus } from '@/types/compare';
import type { SeasonScope } from '@/types/season';

export interface VersusParams {
    season?: SeasonScope | undefined;
    /** one opponent… */
    vs?: string | undefined;
    /** …or a range of each season's leaderboard */
    range?: string | undefined;
    /** a smaller range left out at the top */
    exclude?: string | undefined;
}

export const compareService = {
    /** `opponents` empty: the server picks the top 10 */
    getHeadToHead: (userId: string, opponents: string[], season?: SeasonScope) =>
        getFromApi<HeadToHead>(
            withQuery(`users/${userId}/compare`, { season, with: opponents.join(',') }),
        ),
    getVersus: (userId: string, { season, vs, range, exclude }: VersusParams) =>
        getFromApi<Versus>(
            withQuery(`users/${userId}/versus`, vs ? { season, vs } : { season, range, exclude }),
        ),
    getOpponents: (userId: string, season?: SeasonScope) =>
        getFromApi<OpponentsMet>(withQuery(`users/${userId}/opponents`, { season })),
};
