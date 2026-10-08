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

export interface LeaderboardSearch {
    page?: number | undefined;
    size?: number | undefined;
    q?: string | undefined;
}

/** GET /leaderboard/:id/stats */
export interface LeaderboardStats {
    seasonId: number;
    /** userId → [wins, losses, draws], from the matches our server recorded */
    records: Record<string, [number, number, number]>;
    /** userId → avatar URL, for the players whose profile we have */
    avatars: Record<string, string>;
    message?: string | null;
    error?: string | null;
}
