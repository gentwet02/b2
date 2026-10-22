import type { MatchesQuery } from '@/types/match';
import type { SeasonScope } from '@/types/season';

type Part = string | number | object | undefined;

/** Trailing undefined parts are left out, so a key without them is a prefix of the full ones. */
const key = (...parts: Part[]) => {
    while (parts.length && parts[parts.length - 1] === undefined) parts.pop();
    return parts;
};

type Season = SeasonScope | 'live';

/**
 * Every react-query key in one place. Player keys start with the user id, so
 * `queryKeys.versus(id)` matches every season and opponent of that player's versus.
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
    stats: (...parts: Part[]) => key('stats', ...parts),

    profile: (userId?: string) => key('userProfile', userId),
    seasonStats: (userId: string, season?: Season) => key('seasonStats', userId, season),
    seasonRecords: (userId: string) => key('seasonRecords', userId),
    rankHistory: (userId: string) => key('rankHistory', userId),
    userMatches: (userId: string) => key('userMatches', userId),
    headToHead: (userId: string, season?: Season, opponents?: string) =>
        key('headToHead', userId, season, opponents),
    versus: (userId: string, season?: Season, who?: string) => key('versus', userId, season, who),
    opponentsMet: (userId: string, season?: Season) => key('opponentsMet', userId, season),
};

/** What the profile's Refresh reloads: everything that changes when the player plays. */
export const playerQueryPrefixes = (userId: string) => [
    queryKeys.profile(userId),
    queryKeys.seasonStats(userId),
    queryKeys.matchesHistory({ playerId: userId }),
    queryKeys.headToHead(userId),
    queryKeys.versus(userId),
    queryKeys.opponentsMet(userId),
];
