import type { Match } from './match';

/** wins, losses, draws, always from the profile player's side */
export type Wld = [number, number, number];

/** A map key or a loadout key ("Quincy|Alchemist,Druid,Ninja") with the record on it. */
export interface H2hPick {
    key: string;
    record: Wld;
}

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
    realName: string | null;
    /** rank in the season's leaderboard (live one for "all seasons") */
    rank: number | null;
}

export type CompareSeason = number | 'all';

/** GET /users/:id/compare */
export interface HeadToHead {
    userId: string;
    season: CompareSeason;
    seasonName: string;
    minGames: { opponent: number; total: number };
    labels: {
        maps: Record<string, { map: string; image: string | null }>;
        heroes: Record<string, { hero: string; portrait: string | null }>;
    };
    name: string | null;
    realName: string | null;
    /** against every opponent together */
    total: H2hSummary;
    opponents: H2hOpponent[];
    message?: string | null;
    error?: string | null;
}

export type VersusMode = 'player' | 'top';

export interface VersusOpponent {
    userId: string;
    name: string | null;
    realName: string | null;
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
export interface Versus {
    userId: string;
    name: string | null;
    realName: string | null;
    season: CompareSeason;
    seasonName: string;
    mode: VersusMode;
    vs: string | null;
    range: string | null;
    band: boolean;
    missingSeasons: number[];
    minGames: { opponent: number; total: number };
    labels: HeadToHead['labels'];
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
    message?: string | null;
    error?: string | null;
}

export interface MetOpponent {
    userId: string;
    name: string | null;
    realName: string | null;
    record: Wld;
}

/** GET /users/:id/opponents */
export interface OpponentsMet {
    opponents: MetOpponent[];
    message?: string | null;
    error?: string | null;
}

export interface CompareSearch {
    season?: CompareSeason | undefined;
    /** one opponent */
    vs?: string | undefined;
    /** or a range of each season's leaderboard */
    range?: string | undefined;
    /** only the ranks between the previous range and this one */
    band?: boolean | undefined;
}
