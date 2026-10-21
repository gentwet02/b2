export interface LeaderboardPlayer {
    id: string;
    alias?: string;
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

/** score: the rank order, sorted from the Score header */
export const LEADERBOARD_SORTS = ['rank', 'score', 'games', 'winrate', 'wins', 'name'] as const;
export type LeaderboardSort = (typeof LEADERBOARD_SORTS)[number];

export interface LeaderboardSearch {
    page?: number | undefined;
    size?: number | undefined;
    q?: string | undefined;
    sort?: LeaderboardSort | undefined;
    /** the sort's opposite order */
    reverse?: true | undefined;
    min?: number | undefined;
}
export interface LeaderboardView {
    sort?: LeaderboardSort;
    reverse?: boolean;
    minGames?: number;
}

export interface LeaderboardStats {
    seasonId: number;
    records: Record<string, [number, number, number]>;
    avatars: Record<string, string>;
    message?: string | null;
    error?: string | null;
}

export const LEADERBOARD_SORT_LABELS: Record<LeaderboardSort, string> = {
    rank: 'Rank',
    score: 'Score',
    games: 'Most games',
    winrate: 'Best win rate',
    wins: 'Most wins',
    name: 'Name (A–Z)',
};
