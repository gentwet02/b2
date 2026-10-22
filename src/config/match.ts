import type { MatchResult } from '@/types/match';

export const SIDE_MAX_HEROES = 1;
export const SIDE_MAX_TOWERS = 3;

export const RESULT_TEXT: Record<MatchResult, string> = {
    win: 'Won',
    lose: 'Lost',
    draw: 'Draw',
    cancelled: 'Cancelled',
    lobbyDC: 'Left lobby',
    opponentLobbyDC: 'Opponent left',
};

export const NEUTRAL_TEXT: Record<string, string> = {
    draw: 'Draw',
    cancelled: 'Cancelled',
};
