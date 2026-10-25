import type { LeaderboardSort } from '@/types/leaderboard';

export const LEADERBOARD_DEFAULT_SIZE = 25;
export const LEADERBOARD_PAGE_SIZES = [10, 25, 50, 100];
export const LEADERBOARD_REFRESH_THROTTLE_MS = 2000;
export const LEADERBOARD_MIN_GAMES = [1, 5, 10, 25, 50, 100];
export const LEADERBOARD_MIN_GAMES_DEFAULT = 1;
export const LEADERBOARD_MIN_GAMES_OPTIONS = LEADERBOARD_MIN_GAMES.map((value) => ({
    value,
    label: String(value),
}));

/** score: the rank order (the ranking is by score, so Rank isn't a sort of its own) */
export const LEADERBOARD_SORTS = ['score', 'games', 'winrate', 'wins', 'name'] as const;
export const LEADERBOARD_SORT_DEFAULT = 'score';

/** Table column → leaderboard sort, and the sort's first direction. */
export const LEADERBOARD_HEADER_SORTS: Record<
    string,
    { sort: LeaderboardSort; first: 'asc' | 'desc' }
> = {
    player: { sort: 'name', first: 'asc' },
    // the score order is the rank order: highest first
    score: { sort: 'score', first: 'desc' },
    games: { sort: 'games', first: 'desc' },
    'win-rate': { sort: 'winrate', first: 'desc' },
};

/** The podium's steps, left to right. */
export const PODIUM_ORDER = [2, 1, 3];
