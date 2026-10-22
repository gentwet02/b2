import type { LEADERBOARD_SORTS } from '@/config/leaderboard';
import type { BaseApiResponse } from '@/types/api';
import type { Wld } from '@/types/record';

export interface LeaderboardPlayer {
    id: string;
    alias?: string;
    name: string;
    score: number;
    currentlyInHoM: boolean;
}

export interface RankedPlayer extends LeaderboardPlayer {
    rank: number;
}

/** The server's compact player: i = id, r = alias, n = name, d = in HoM flag + score */
export interface LeaderboardPlayerEncoded {
    i: string;
    r?: string;
    n: string;
    d: string;
}

/** GET /leaderboard/:season */
export interface LeaderboardResponse extends BaseApiResponse {
    seasonId?: number;
    live?: boolean;
    lastUpdated?: string;
    data?: LeaderboardPlayerEncoded[];
}

/** GET /leaderboard/:season/stats */
export interface LeaderboardStats extends BaseApiResponse {
    seasonId: number;
    records: Record<string, Wld>;
    avatars: Record<string, string>;
}

export type LeaderboardSort = (typeof LEADERBOARD_SORTS)[number];

/** /leaderboard/:season URL search */
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

/** A leaderboard row: the player and their recorded games. */
export interface LeaderboardLine {
    player: RankedPlayer;
    wins: number;
    losses: number;
    draws: number;
    games: number;
    rate: number | null;
}
