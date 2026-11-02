import { getFromApi, withQuery } from '@/services/api/client';
import type { CompareGamesPage, Comparison, HeadToHead, OpponentsMet } from '@/types/compare';
import type { MatchSort } from '@/types/match';
import type { SeasonQuery, SeasonScope } from '@/types/season';

/** One side: a player, a range (and a smaller one left out), or anyone (side 2). */
export type CompareSideParams =
    | { player: string }
    | { range: string; exclude?: string | undefined }
    | { anyone: true };

export interface CompareParams {
    season?: SeasonQuery | undefined;
    a: CompareSideParams;
    b: CompareSideParams;
    /** false: a player in both ranges counts only for side 1 */
    overlap?: boolean | undefined;
    /** map and loadout filters, the /stats URL names (map, hero, towers, hero2…) */
    filters?: Record<string, string | undefined> | undefined;
}

/** A side with nothing empty in it. */
function normalizeSide(side: CompareSideParams): CompareSideParams {
    return 'player' in side || 'anyone' in side
        ? side
        : side.exclude
          ? { range: side.range, exclude: side.exclude }
          : { range: side.range };
}

/**
 * The params as the server reads them: no empty filter, `overlap` only when off. The request and
 * the react-query key are both made from it (key objects are hashed whatever their key order).
 */
export function normalizeCompareParams({ season, a, b, overlap, filters }: CompareParams): CompareParams {
    const kept = Object.entries(filters ?? {}).filter(([, value]) => !!value);
    return {
        season,
        a: normalizeSide(a),
        b: normalizeSide(b),
        overlap: overlap === false ? false : undefined,
        filters: kept.length ? Object.fromEntries(kept) : undefined,
    };
}

function sideQuery(side: CompareSideParams, suffix: '' | '2') {
    return 'player' in side
        ? { [`player${suffix}`]: side.player }
        : 'anyone' in side
          ? {}
          : // the names /stats takes too
            { [`players${suffix}`]: side.range, [`exclude${suffix}`]: side.exclude };
}

export const compareService = {
    /** `opponents` empty: the server picks the top 10 */
    getHeadToHead: (userId: string, opponents: string[], season?: SeasonScope) =>
        getFromApi<HeadToHead>(
            withQuery(`users/${userId}/compare`, { season, with: opponents.join(',') }),
        ),
    getComparison: ({ season, a, b, overlap, filters }: CompareParams) =>
        getFromApi<Comparison>(
            withQuery('compare', {
                season,
                ...sideQuery(a, ''),
                ...sideQuery(b, '2'),
                overlap: overlap === false ? 0 : undefined,
                ...filters,
            }),
        ),
    /** a player on at least one side */
    getCompareGames: (
        { season, a, b, overlap, filters }: CompareParams,
        sort: MatchSort,
        offset: number,
        limit: number,
    ) =>
        getFromApi<CompareGamesPage>(
            withQuery('compare/games', {
                season,
                ...sideQuery(a, ''),
                ...sideQuery(b, '2'),
                overlap: overlap === false ? 0 : undefined,
                ...filters,
                sort,
                offset,
                limit,
            }),
        ),
    getOpponents: (userId: string, season?: SeasonQuery) =>
        getFromApi<OpponentsMet>(withQuery(`users/${userId}/opponents`, { season })),
};
