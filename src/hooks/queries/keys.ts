import type { MatchesQuery } from '@/types/match';
import type { SeasonQuery } from '@/types/season';

type Part = string | number | object | undefined;

/** Trailing undefined parts are left out, so a key without them is a prefix of the full ones. */
function key(...parts: Part[]) {
    while (parts.length && parts[parts.length - 1] === undefined) parts.pop();
    return parts;
}

type Season = SeasonQuery | 'live';

/**
 * Every react-query key in one place. Player keys start with the user id, so
 * `queryKeys.headToHead(id)` matches every season and opponent set of that player's card.
 */
export const queryKeys = {
    info: () => key('info'),
    leaderboard: (seasonId?: number) => key('leaderboard', seasonId),
    leaderboardStats: (seasonId?: number) => key('leaderboardStats', seasonId),
    avatar: (id: string) => key('avatar', id),
    playerName: (id: string) => key('playerName', id),
    matchesHistory: (query: Partial<MatchesQuery>, pageSize?: number) =>
        key('matchesHistory', query, pageSize),
    matchFilters: (filters: Omit<MatchesQuery, 'sort'>) => key('matchFilters', filters),
    /** the normalized params (services/api/stats): objects hash whatever their key order */
    stats: (params?: object) => key('stats', params),
    /** the normalized params (services/api/compare), or 'games', the params and the sort */
    compare: (...parts: Part[]) => key('compare', ...parts),
    clans: () => key('clans'),
    clan: (clanId: string) => key('clan', clanId),
    clanOverview: (clanId: string) => key('clanOverview', clanId),

    profile: (userId?: string) => key('userProfile', userId),
    seasonStats: (userId: string, season?: Season) => key('seasonStats', userId, season),
    seasonRecords: (userId: string) => key('seasonRecords', userId),
    rankHistory: (userId: string) => key('rankHistory', userId),
    userMatches: (userId: string) => key('userMatches', userId),
    headToHead: (userId: string, season?: Season, opponents?: string) =>
        key('headToHead', userId, season, opponents),
    /** `id`: the player's, or a clan's */
    opponentsMet: (id: string, season?: Season) => key('opponentsMet', id, season),
};

/** What the profile's Refresh reloads: everything that changes when the player plays. */
export function playerQueryPrefixes(userId: string) {
    return [
        queryKeys.profile(userId),
        queryKeys.seasonStats(userId),
        queryKeys.matchesHistory({ playerId: userId }),
        queryKeys.headToHead(userId),
        // comparisons aren't keyed by player: any of them may hold this one
        queryKeys.compare(),
        queryKeys.opponentsMet(userId),
    ];
}
