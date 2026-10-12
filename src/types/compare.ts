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

export interface CompareSearch {
    season?: CompareSeason | undefined;
}
