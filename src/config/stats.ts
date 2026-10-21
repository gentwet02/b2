import { COMPARE_RANGES } from '@/config/compare';
import type { StatsView } from '@/types/stats';

/** "All HoM players" is everyone: the leaderboard (the other players met are not counted). */
export const STATS_PLAYERS = COMPARE_RANGES;
export const STATS_PLAYERS_DEFAULT = 't25';

export const STATS_VIEWS: { value: StatsView; label: string }[] = [
    { value: 'heroes', label: 'Heroes' },
    { value: 'towers', label: 'Towers' },
    { value: 'loadouts', label: 'Strats' },
    { value: 'maps', label: 'Maps' },
];
export const STATS_VIEW_DEFAULT: StatsView = 'heroes';

export const STATS_MIN_GAMES = [1, 5, 10, 25, 50, 100, 250] as const;
export const STATS_MIN_DEFAULT = 1;

/** minimum pick rate, in % of the group's games (maps: of the games on the map, or of all maps) */
export const STATS_MIN_PICK = [0, 0.5, 1, 2, 5, 10, 25] as const;
export const STATS_MIN_PICK_DEFAULT = 0;

export const STATS_MAX_TOWERS = 3;

export const statsPlayersLabel = (value: string) =>
    STATS_PLAYERS.find((p) => p.value === value)?.label ?? value;
