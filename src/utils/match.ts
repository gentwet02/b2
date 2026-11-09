import type { Match, MatchResult, Outcome } from '@/types/match';

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

/** A stored match's identity: ids only repeat across seasons. */
export const matchKey = (match: Match) => `${match.seasonId ?? ''}:${match.id}`;

/**
 * Each match once, first seen kept. Offset pages overlap when new matches come in while the
 * list is open (the newest sort pushes the rest down a page).
 */
export function uniqueMatches(matches: Match[]) {
    const seen = new Set<string>();
    return matches.filter((match) => {
        const key = matchKey(match);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}
