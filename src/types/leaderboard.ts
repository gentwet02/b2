import type { LEADERBOARD_SORTS } from '@/config/leaderboard';
import type { BaseApiResponse } from '@/types/api';
import type { PlayerTag } from '@/types/player';
import type { Wld } from '@/types/record';

export interface LeaderboardPlayer {
    id: string;
    alias?: string;
    tag?: PlayerTag;
    name: string;
    score: number;
    currentlyInHoM: boolean;
    /** names the player went by before */
    oldNames?: string[];
    /** the player's current name, when they ranked under another one (past seasons) */
    currentName?: string;
}

export interface RankedPlayer extends LeaderboardPlayer {
    rank: number;
}

/** A player of several seasons' leaderboards, at the newest one they ranked in. */
export interface SeasonsPlayer extends RankedPlayer {
    /** that season, when it isn't the newest one counted (the rank is that season's) */
    seasonId?: number;
}

/**
 * The server's compact player: i = id, r = alias, t = tag, n = name, d = in HoM flag + score,
 * o = old names, c = current name (when it isn't n)
 */
export interface LeaderboardPlayerEncoded {
    i: string;
    r?: string;
    t?: PlayerTag;
    n: string;
    d: string;
    o?: string[];
    c?: string;
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
    q?: string | undefined;
    sort?: LeaderboardSort | undefined;
    /** the sort's opposite order */
    reverse?: true | undefined;
    min?: number | undefined;
    /** the search also matches the names players had before */
    allNames?: true | undefined;
}

export interface LeaderboardView {
    sort?: LeaderboardSort;
    reverse?: boolean;
    minGames?: number;
    allNames?: boolean;
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
