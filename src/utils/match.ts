import type { MatchResult, Outcome } from '@/types/match';

/** Leaving the lobby counts as a loss, the opponent leaving as a win. */
export function matchOutcome(result: MatchResult): Outcome {
    switch (result) {
        case 'win':
        case 'opponentLobbyDC':
            return 'win';
        case 'lose':
        case 'lobbyDC':
            return 'lose';
        default:
            return 'neutral';
    }
}
