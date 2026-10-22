import type { LeaderboardSort } from '@/types/leaderboard';

export const LEADERBOARD_DEFAULT_SIZE = 25;
export const LEADERBOARD_PAGE_SIZES = [10, 25, 50, 100];
/** Refresh button: at most one reload per this many ms. */
export const LEADERBOARD_REFRESH_THROTTLE_MS = 2000;
export const LEADERBOARD_MIN_GAMES = [0, 5, 10, 25, 50, 100];
export const LEADERBOARD_MIN_GAMES_OPTIONS = LEADERBOARD_MIN_GAMES.map((value) => ({
    value,
    label: value === 0 ? 'Any' : `${value}+`,
}));

/** score: the rank order, sorted from the Score header */
export const LEADERBOARD_SORTS = ['rank', 'score', 'games', 'winrate', 'wins', 'name'] as const;
export const LEADERBOARD_SORT_DEFAULT = 'rank';

/** Table column → leaderboard sort, and the sort's first direction. */
export const LEADERBOARD_HEADER_SORTS: Record<
    string,
    { sort: LeaderboardSort; first: 'asc' | 'desc' }
> = {
    rank: { sort: 'rank', first: 'asc' },
    player: { sort: 'name', first: 'asc' },
    // the score order is the rank order: highest first
    score: { sort: 'score', first: 'desc' },
    games: { sort: 'games', first: 'desc' },
    'win-rate': { sort: 'winrate', first: 'desc' },
};

/** The podium's steps, left to right: the winner in the middle. */
export const PODIUM_ORDER = [2, 1, 3];
