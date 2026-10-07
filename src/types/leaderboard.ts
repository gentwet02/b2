export interface LeaderboardPlayer {
    id: string;
    realName?: string;
    name: string;
    score: number;
    currentlyInHoM: boolean;
}

export interface LeaderboardPlayerEncoded {
    i: string;
    r?: string;
    n: string;
    d: string;
}

export interface LeaderboardResponse {
    seasonId?: number;
    live?: boolean;
    lastUpdated?: string;
    data?: LeaderboardPlayerEncoded[];
    message?: string | null;
    error?: string | null;
}
