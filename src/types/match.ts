export type MatchResult = 'win' | 'lose' | 'draw' | 'cancelled' | 'lobbyDC' | 'opponentLobbyDC';
export type Outcome = 'win' | 'lose' | 'neutral';
export type MatchPick = { kind: 'hero' | 'tower' | 'map'; value: string };

export interface MatchPlayer {
    displayName: string;
    hero: string;
    heroPortrait?: string;
    towerone: string;
    towertwo: string;
    towerthree: string;
    currentUser?: boolean;
    result: MatchResult;
    profileURL: string;
    /** Stored matches: the player's known alias, when there is one. */
    alias?: string;
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
    /** Stored matches only: when our crawler first saw the match (NK gives no play date). */
    seenAt?: string;
}

export interface CrawlProgress {
    done: number;
    total: number;
}

export const MATCH_SORTS = ['newest', 'oldest', 'longest', 'shortest', 'rounds'] as const;
export type MatchSort = (typeof MATCH_SORTS)[number];

/**
 * Filters of the match history; also its URL search params.
 * Lists are comma separated to keep URLs readable.
 */
export interface MatchesQuery {
    season?: number | undefined;
    player?: string | undefined;
    /** one player's matches (profiles) */
    playerId?: string | undefined;
    /** up to 2: "Quincy" = any variant, "Quincy:Quincy_Cyber" = that variant */
    heroes?: string | undefined;
    /** up to 6, all of them in the match */
    towers?: string | undefined;
    /** map key, see MatchFilterOptions.maps */
    map?: string | undefined;
    sort?: MatchSort | undefined;
    /**
     * "Same player": filter each side separately. player, heroes (≤ 1) and towers (≤ 3)
     * then describe one side, player2, heroes2 and towers2 the other; either may be empty.
     */
    sameSide?: boolean | undefined;
    player2?: string | undefined;
    heroes2?: string | undefined;
    towers2?: string | undefined;
}

/** One page of GET /matches-history (read from the database). */
export interface MatchesPage {
    seasonId: number;
    /** every match stored for the season */
    totalMatches: number;
    /** matches fitting the filters */
    total: number;
    offset: number;
    limit: number;
    sort: MatchSort;
    sameSideApplied: boolean;
    items: Match[];
}

export interface CrawlInfo {
    isFetching: boolean;
    progress: CrawlProgress | null;
    inserted: number;
    lastRunEndedAt: string | null;
}

export interface MatchesResponse {
    matches: MatchesPage;
    /** live season only */
    crawl: CrawlInfo | null;
    message: string | null;
    error: string | null;
}

/** Heroes and towers available for one side (or both sides when not split). */
export interface SideFilterOptions {
    heroes: {
        base: string;
        count: number;
        variants: { hero: string; count: number; portrait?: string }[];
    }[];
    towers: { tower: string; count: number }[];
}

/** GET /matches-history/filters: what the season's stored matches contain. */
export interface MatchFilterOptions extends SideFilterOptions {
    seasonId: number;
    /** same player mode: the options of side 1 and side 2 */
    sides?: [SideFilterOptions, SideFilterOptions];
    maps: { key: string; map: string; count: number }[];
    sorts: MatchSort[];
    maxHeroes: number;
    maxTowers: number;
    message?: string | null;
    error?: string | null;
}

/** GET /users/:id/matches — Ninja Kiwi's answer, passed through by the server. */
export interface UserMatchesResponse {
    success: boolean;
    error: string | null;
    message?: string | null;
    body: Match[];
}

export interface MatchesUpdateResponse {
    message: string;
}

export const SORT_LABELS: Record<MatchSort, string> = {
    newest: 'Newest first',
    oldest: 'Oldest first',
    longest: 'Longest',
    shortest: 'Shortest',
    rounds: 'Most rounds',
};
