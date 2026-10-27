import type { LeaderboardRange } from '@/config/ranges';
import type { StatsView } from '@/types/stats';

/** "All HoM players" is everyone: the leaderboard (the other players met are not counted). */
export const STATS_PLAYERS_DEFAULT: LeaderboardRange = 't25';

export const STATS_VIEWS: { value: StatsView; label: string }[] = [
    { value: 'heroes', label: 'Heroes' },
    { value: 'towers', label: 'Towers' },
    { value: 'loadouts', label: 'Strats' },
    { value: 'maps', label: 'Maps' },
];

/** Tabs about the players: each side's table, and the latest games (a side is one player). */
export const STATS_PLAYER_VIEWS = ['players', 'opponents', 'games'] as const;
export const STATS_VIEW_DEFAULT: StatsView = 'heroes';

export const STATS_MIN_GAMES = [1, 5, 10, 25, 50, 100, 250] as const;
export const STATS_MIN_DEFAULT = 1;
export const STATS_MIN_GAMES_OPTIONS = STATS_MIN_GAMES.map((n) => ({ value: n, label: String(n) }));

/** minimum pick rate, in % of the group's games (maps: of the games on the map, or of all maps) */
export const STATS_MIN_PICK = [0, 0.5, 1, 2, 5, 10, 25] as const;
export const STATS_MIN_PICK_DEFAULT = 0;
export const STATS_MIN_PICK_OPTIONS = STATS_MIN_PICK.map((n) => ({
    value: n,
    label: `${n}%`,
}));

export const STATS_MAX_TOWERS = 3;

/** Rows per "show more" of the big tables. */
export const STATS_PAGE_SIZE = 50;
export const STATS_TOWERS_PAGE_SIZE = 60;

/** Who each side is: a range of each leaderboard, or one player. */
export const STATS_MODES = [
    { value: 'top', label: 'Top players' },
    { value: 'player', label: 'One player' },
] as const;

/** Against, by default: every HoM player (a player in both ranges counts for the first side). */
export const STATS_AGAINST_DEFAULT: LeaderboardRange = 'all';
