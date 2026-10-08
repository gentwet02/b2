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

export const LEADERBOARD_SORTS = ['rank', 'games', 'winrate', 'wins', 'name'] as const;
export type LeaderboardSort = (typeof LEADERBOARD_SORTS)[number];

export interface LeaderboardSearch {
    page?: number | undefined;
    size?: number | undefined;
    q?: string | undefined;
    sort?: LeaderboardSort | undefined;
    min?: number | undefined;
    known?: boolean | undefined;
}
export interface LeaderboardView {
    sort?: LeaderboardSort;
    minGames?: number;
    knownOnly?: boolean;
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
    games: 'Most games',
    winrate: 'Best win rate',
    wins: 'Most wins',
    name: 'Name (A–Z)',
};
