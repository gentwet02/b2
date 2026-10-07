export type MatchResult = 'win' | 'lose' | 'draw' | 'cancelled' | 'lobbyDC' | 'opponentLobbyDC';

export interface MatchPlayer {
    displayName: string;
    hero: string;
    heroPortrait?: string;
    towerone: string;
    towertwo: string;
    towerthree: string;
    currentUser?: boolean;
    result: MatchResult | string;
    profileURL: string;
}

export interface Match {
    id: string;
    gametype: string;
    map: string;
    duration: number;
    endRound: number;
    mapURL?: string;
    playerLeft: MatchPlayer;
    playerRight: MatchPlayer;
}

export interface CachedMatches {
    lastUpdated: string;
    totalMatches: number;
    matches: Match[];
    seasonID?: number;
}

export interface MatchesResponse {
    matches: CachedMatches | null;
    message: string | null;
    error: string | null;
}

/** GET /users/:id/matches — Ninja Kiwi's answer, passed through by the server. */
export interface UserMatchesResponse {
    success: boolean;
    error: string | null;
    message?: string | null;
    body: Match[];
}

export interface MatchesStatusResponse {
    message: 'running';
    hasCache: boolean;
    isFetching: boolean;
    totalMatches: number;
    seasonId: number | null;
    lastUpdated: string | null;
    lastError: string | null;
    nextUpdateIn: number | 'unknown';
    timestamp: string;
}

export interface MatchesUpdateResponse {
    message: string;
}
