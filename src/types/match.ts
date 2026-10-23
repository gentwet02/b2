import type { MATCH_SORTS } from '@/config/match';
import type { BaseApiResponse } from '@/types/api';
import type { MapVariant } from '@/types/map';
import type { SeasonScope } from '@/types/season';

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
    /** "Include old names" searches: the older name the search found this player by. */
    matchedName?: string;
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
    /** Stored matches only: the season the match was recorded in. */
    seasonId?: number;
}

export interface CrawlProgress {
    done: number;
    total: number;
}

export type MatchSort = (typeof MATCH_SORTS)[number];

/**
 * Filters of the match history; also its URL search params.
 * Lists are comma separated to keep URLs readable.
 */
export interface MatchesQuery {
    /** undefined: the live season; "all": every recorded season */
    season?: SeasonScope | undefined;
    player?: string | undefined;
    /** one player's matches (profiles) */
    playerId?: string | undefined;
    /** up to 2: "Quincy" = any variant, "Quincy:Quincy_Cyber" = that variant */
    heroes?: string | undefined;
    /** up to 6, all of them in the match */
    towers?: string | undefined;
    /** map key, see MatchFilterOptions.maps: "oasis", "oasis:classic" or "oasis:reversed" */
    map?: string | undefined;
    sort?: MatchSort | undefined;
    /**
     * "Same player": filter each side separately. player, heroes (≤ 1) and towers (≤ 3)
     * then describe one side, player2, heroes2 and towers2 the other; either may be empty.
     */
    sameSide?: boolean | undefined;
    player2?: string | undefined;
    /** the player searches also match the names players had before */
    allNames?: boolean | undefined;
    heroes2?: string | undefined;
    towers2?: string | undefined;
}

/** One page of GET /matches-history (read from the database). */
export interface MatchesPage {
    /** null: every season */
    seasonId: number | null;
    /** every season only: the oldest season with recorded matches */
    firstSeasonId?: number | null;
    /** every match stored for the season (or for every season) */
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

export interface MatchesResponse extends BaseApiResponse {
    matches: MatchesPage;
    /** live season (or every season) only */
    crawl: CrawlInfo | null;
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
export interface MatchFilterOptions extends SideFilterOptions, BaseApiResponse {
    /** null: every season */
    seasonId: number | null;
    /** same player mode: the options of side 1 and side 2 */
    sides?: [SideFilterOptions, SideFilterOptions];
    /** base maps: classic and reversed versions together, counted apart in `variants` */
    maps: {
        key: string;
        map: string;
        count: number;
        image: string | null;
        variants: { variant: MapVariant; count: number }[];
    }[];
    sorts: MatchSort[];
    maxHeroes: number;
    maxTowers: number;
}

/** GET /users/:id/matches — Ninja Kiwi's latest matches, through the server (rate limited). */
export interface UserMatchesResponse extends BaseApiResponse {
    success: boolean;
    body: Match[];
}
