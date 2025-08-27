export interface MatchPlayer {
    displayName: string;
    hero: string;
    heroPortrait: string;
    towerone: string;
    towertwo: string;
    towerthree: string;
    currentUser: boolean;
    result: string;
    profileURL: string;
}

export interface Match {
    id: string;
    gametype: string;
    map: string;
    duration: number;
    endRound: number;
    mapURL: string;
    playerLeft: MatchPlayer;
    playerRight: MatchPlayer;
}

export interface CachedMatches {
    lastUpdated: Date;
    totalMatches: number;
    matches: Match[];
}

export interface MatchesResponse {
    matches: CachedMatches;
    message: string | null;
    error: string | null;
}

export interface MatchesStatusResponse {
    message: 'running';
    hasCache: boolean;
    isFetching: boolean;
    lastUpdated: Date | null;
    nextUpdateIn: Date | 'unknown';
    timestamp: Date;
}

export interface MatchesUpdateResponse {
    message: string;
}
