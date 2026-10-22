import type { LeaderboardRange } from '@/config/ranges';

/** Opponents on the profile's head to head card. */
export const COMPARE_SLOTS = 10;

/** Player mode: the latest games between the two (the server sends at most this many). */
export const COMPARE_MAX_MATCHES = 30;

/** Range mode: opponents per "show more". */
export const COMPARE_OPPONENTS_PAGE_SIZE = 100;

/** Head to head maps: classic and reversed versions apart (until the visitor changes it). */
export const COMPARE_SPLIT_MAPS_DEFAULT = true;

export const COMPARE_RANGE_DEFAULT: LeaderboardRange = 't10';

/** Compare against a range of each leaderboard, or one player. */
export const COMPARE_MODES = [
    { value: 'top', label: 'Top players' },
    { value: 'player', label: 'One player' },
] as const;
