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
    /** base map key ("oasis") → record, both versions together */
    maps: Record<string, Wld>;
    /** "oasis" / "oasis:reversed" → record */
    mapVariants?: Record<string, Wld>;
    top: H2hPicks;
    best: H2hPicks;
    worst: H2hPicks;
    /** best and worst with variants apart ("oasis:reversed", "Quincy_Cyber|…") */
    variants?: { best: H2hPicks; worst: H2hPicks };
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
    /** raw hero ("Quincy_Cyber") → base and portrait, for loadouts with variants apart */
    variants?: Record<string, { base: string; portrait: string | null }>;
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

/** A player of one side of a comparison, with the record between the sides (side 1's view). */
export interface CompareMember {
    userId: string;
    name: string | null;
    alias: string | null;
    /** best rank among the seasons counted */
    rank: number | null;
    /** seasons the player was on that side */
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

export interface CompareSeasonRow {
    seasonId: number;
    name: string;
    /** ranks counted that season on each side (range sides) */
    boundsA: RankBounds | null;
    bounds: RankBounds | null;
    /** players counted that season on each side */
    groupA: number;
    group: number;
    record: Wld;
    lastMet: string | null;
}

/** Who a side is: one player, a range of each season's leaderboard, or anyone (side 2). */
export interface CompareSideInfo {
    mode: GroupMode | 'anyone';
    userId: string | null;
    name: string | null;
    alias: string | null;
    range: string | null;
    /** the smaller range left out at the top */
    exclude: string | null;
}

/** Which side: the first one (the records are its own) or the second. */
export type CompareSideKey = 'a' | 'b';

/** GET /compare */
export interface Comparison extends BaseApiResponse {
    season: SeasonScope;
    seasonName: string;
    /** a player in both ranges counts on both sides */
    overlap?: boolean;
    a: CompareSideInfo;
    b: CompareSideInfo;
    missingSeasons: number[];
    minGames: { opponent: number; total: number };
    labels: Labels;
    total: H2hSummary & {
        mapList: H2hPick[];
        mapVariantList?: H2hPick[];
        /** side 1's loadouts, most played first */
        mine: H2hPick[];
        /** side 2's loadouts */
        theirs: H2hPick[];
        /** the same with hero variants apart */
        mineVariants?: H2hPick[];
        theirsVariants?: H2hPick[];
    };
    /** side 1's players; never-met players have a 0–0 record */
    players: CompareMember[];
    /** side 2's players (none against anyone) */
    opponents: CompareMember[];
    /** newest first */
    seasons: CompareSeasonRow[];
    /** a player on either side: the latest games between the sides, newest first */
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

/** GET /compare/games: one page of the games between the two sides. */
export interface CompareGamesPage extends BaseApiResponse {
    total: number;
    offset: number;
    limit: number;
    items: Match[];
}

/** What a head to head tile shows. */
export type H2hTileKind = 'map' | 'loadout';
