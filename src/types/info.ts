export interface SeasonSummary {
    id: number;
    name: string;
    live: boolean;
}

export interface infoResponse {
    message: string | null;
    error: string | null;
    liveSeason: number;
    liveSeasonName?: string;
    totalScores: number;
    seasons?: SeasonSummary[];
    lastFetch?: string | null;
}
