import type { BaseApiResponse } from '@/types/api';
import type { Match } from '@/types/match';
import type { RecordRow, Wld } from '@/types/record';
import type { GroupMode, SeasonScope } from '@/types/season';

/** A map key or a loadout key ("Quincy|Alchemist,Druid,Ninja") with the record on it. */
export type H2hPick = RecordRow;

interface H2hPicks {
    map: H2hPick | null;
    /** the profile player's loadouts */
    mine: H2hPick | null;
    /** the opponent's loadouts (record still from the profile player's side) */
    theirs: H2hPick | null;
}

/** Games between the profile player and one opponent (or all of them). */
export interface H2hSummary {
    record: Wld;
    lastMet: string | null;
    /** map key → record */
    maps: Record<string, Wld>;
    top: H2hPicks;
    best: H2hPicks;
    worst: H2hPicks;
}

export interface H2hOpponent extends H2hSummary {
    userId: string;
    name: string | null;
    alias: string | null;
    /** rank in the season's leaderboard (live one for "all seasons") */
    rank: number | null;
}

/** Names and pictures of the maps and heroes in a response, by key. */
export interface Labels {
    maps: Record<string, { map: string; image: string | null }>;
    heroes: Record<string, { hero: string; portrait: string | null }>;
}

/** GET /users/:id/compare */
export interface HeadToHead extends BaseApiResponse {
    userId: string;
    season: SeasonScope;
    seasonName: string;
    minGames: { opponent: number; total: number };
    labels: Labels;
    name: string | null;
    alias: string | null;
    /** against every opponent together */
    total: H2hSummary;
    opponents: H2hOpponent[];
}

export interface VersusOpponent {
    userId: string;
    name: string | null;
    alias: string | null;
    /** best rank among the seasons counted */
    rank: number | null;
    /** seasons the player was in the group */
    seasons: number;
    record: Wld;
    lastMet: string | null;
}

export interface RankBounds {
    from: number;
    to: number;
    /** players in that season's leaderboard */
    size: number;
}

export interface VersusSeasonRow {
    seasonId: number;
    name: string;
    /** range mode: ranks counted that season */
    bounds: RankBounds | null;
    /** opponents counted that season */
    group: number;
    record: Wld;
    lastMet: string | null;
}

/** GET /users/:id/versus */
export interface Versus extends BaseApiResponse {
    userId: string;
    name: string | null;
    alias: string | null;
    season: SeasonScope;
    seasonName: string;
    mode: GroupMode;
    vs: string | null;
    range: string | null;
    /** the smaller range left out at the top */
    exclude?: string | null | undefined;
    band: boolean;
    missingSeasons: number[];
    minGames: { opponent: number; total: number };
    labels: Labels;
    total: H2hSummary & {
        mapList: H2hPick[];
        /** the profile player's loadouts, most played first */
        mine: H2hPick[];
        /** the opponents' loadouts */
        theirs: H2hPick[];
    };
    /** never-met players have a 0–0 record */
    opponents: VersusOpponent[];
    /** newest first */
    seasons: VersusSeasonRow[];
    /** player mode: latest games between the two, newest first */
    matches: Match[] | null;
}

export interface MetOpponent {
    userId: string;
    name: string | null;
    alias: string | null;
    record: Wld;
}

/** GET /users/:id/opponents */
export interface OpponentsMet extends BaseApiResponse {
    opponents: MetOpponent[];
}

export interface CompareSearch {
    season?: SeasonScope | undefined;
    /** one opponent */
    vs?: string | undefined;
    /** or a range of each season's leaderboard */
    range?: string | undefined;
    /** a smaller range left out at the top */
    exclude?: string | undefined;
}

/** What a head to head tile shows. */
export type H2hTileKind = 'map' | 'loadout';
