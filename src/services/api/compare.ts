import { getFromApi, withQuery } from '@/services/api/client';
import type { CompareGamesPage, Comparison, HeadToHead, SideOpponents } from '@/types/compare';
import type { MatchSort } from '@/types/match';
import type { SeasonQuery, SeasonScope } from '@/types/season';

/**
 * One side: a player, a clan, a range (and a smaller one left out), a list of those as the
 * URL's tags ("p:<id>,r:t10"), or anyone (side 2).
 */
export type CompareSideParams = (
    | { list: string }
    | { player: string }
    | { clan: string }
    | { range: string; exclude?: string | undefined }
    | { anyone: true }
) & {
    /** the players, clans and ranges left out, as tags too (not of one player, nor of anyone) */
    not?: string | undefined;
};

/** A side that is picked: one player or one clan. */
export type MetSideParams = { player: string } | { clan: string };

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
    if ('player' in side) return { player: side.player };
    if ('anyone' in side) return { anyone: true };
    const own =
        'list' in side
            ? { list: side.list }
            : 'clan' in side
              ? { clan: side.clan }
              : side.exclude
                ? { range: side.range, exclude: side.exclude }
                : { range: side.range };
    return side.not ? { ...own, not: side.not } : own;
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
    return { ...ownQuery(side, suffix), [`not${suffix}`]: side.not };
}

function ownQuery(side: CompareSideParams, suffix: '' | '2') {
    if ('list' in side) return { [`list${suffix}`]: side.list };
    if ('player' in side) return { [`player${suffix}`]: side.player };
    if ('clan' in side) return { [`clan${suffix}`]: side.clan };
    if ('anyone' in side) return {};
    // the names /stats takes too
    return { [`players${suffix}`]: side.range, [`exclude${suffix}`]: side.exclude };
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
    /** a player or a clan on at least one side */
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
    /** who a player or a clan met: the players, and the clans they are in */
    getSideOpponents: (side: MetSideParams, season?: SeasonQuery) =>
        getFromApi<SideOpponents>(withQuery('compare/opponents', { ...side, season })),
};
