import type { MatchResult, MatchSort } from '@/types/match';

/** Pages of the match history (the server clamps to 50). */
export const MATCHES_PAGE_SIZE = 20;

/** "Filter sides separately": what one side can hold. */
export const SIDE_MAX_HEROES = 1;
export const SIDE_MAX_TOWERS = 3;

/** Shared filters, until the server's options say otherwise. */
export const MATCH_MAX_HEROES = 2;
export const MATCH_MAX_TOWERS = 6;

export const MATCH_SORTS = ['newest', 'oldest', 'longest', 'shortest', 'rounds'] as const;
export const MATCH_SORT_DEFAULT: MatchSort = 'newest';

export const MATCH_SORT_LABELS: Record<MatchSort, string> = {
    newest: 'Newest first',
    oldest: 'Oldest first',
    longest: 'Longest',
    shortest: 'Shortest',
    rounds: 'Most rounds',
};

export const MATCH_SORT_OPTIONS = MATCH_SORTS.map((value) => ({
    value,
    label: MATCH_SORT_LABELS[value],
}));

export const RESULT_TEXT: Record<MatchResult, string> = {
    win: 'Won',
    lose: 'Lost',
    draw: 'Draw',
    cancelled: 'Cancelled',
    lobbyDC: 'Left lobby',
    opponentLobbyDC: 'Opponent left',
};

/** What the middle of the card says when nobody won. */
export const NEUTRAL_TEXT: Partial<Record<MatchResult, string>> = {
    draw: 'Draw',
    cancelled: 'Cancelled',
};
