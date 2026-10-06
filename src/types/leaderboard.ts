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
    data?: LeaderboardPlayerEncoded[];
    message?: string;
    error?: string;
}
