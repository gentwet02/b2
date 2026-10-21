import type { HeadToHead, RankBounds, Wld } from './compare';
import type { SideFilterOptions } from './match';
import type { HeroPick } from './tower';

export type StatsSeason = number | 'all';
export type StatsMode = 'player' | 'top' | 'everyone';
export type StatsView = 'heroes' | 'towers' | 'loadouts' | 'maps';

/** A hero base, a tower, a loadout key ("Quincy|Alchemist,Druid,Ninja") or a map key. */
export interface StatsRow {
    key: string;
    record: Wld;
}

export interface StatsMapRow extends StatsRow {
    /** the group's games on that map, focus or not */
    total: number;
}

export interface StatsOption {
    key: string;
    count: number;
}

/** GET /stats */
export interface Stats {
    season: StatsSeason;
    seasonName: string;
    mode: StatsMode;
    /** range (top mode) or "everyone" */
    players: string | null;
    band: boolean;
    player: { userId: string; name: string | null; alias: string | null } | null;
    filters: {
        map: { base: string; variant?: 'classic' | 'reversed' } | null;
        hero: HeroPick | null;
        towers: string[];
    };
    seasons: {
        seasonId: number;
        name: string;
        bounds: RankBounds | null;
        /** players counted that season; null: everyone */
        players: number | null;
    }[];
    missingSeasons: number[];
    /** the group's games (on the map), one per player side */
    group: Wld;
    /** the games with the focused hero / towers (on the map) */
    selection: Wld;
    heroes: StatsRow[];
    /** one row per hero variant (raw hero, "Quincy_Cyber") */
    heroVariants: StatsRow[];
    towers: StatsRow[];
    /** most played first, at most 500 */
    loadouts: StatsRow[];
    loadoutCount: number;
    /** strats without the hero: "Alchemist,Druid,Ninja", at most 500 */
    trios: StatsRow[];
    trioCount: number;
    /** the focus on every map (the map filter is ignored here) */
    maps: StatsMapRow[];
    /** classic and reversed apart: "oasis", "oasis:reversed" */
    mapVariants: StatsMapRow[];
    /** heroes (with variants) and towers in the match filters' shape */
    options: SideFilterOptions & {
        /** base maps, with their classic / reversed games */
        maps: (StatsOption & { variants: { variant: 'classic' | 'reversed'; count: number }[] })[];
    };
    labels: HeadToHead['labels'] & {
        /** raw hero → its base and portrait */
        variants: Record<string, { base: string; portrait: string | null }>;
    };
    message?: string | null;
    error?: string | null;
}

export interface StatsParams {
    season?: StatsSeason | undefined;
    player?: string | undefined;
    players?: string | undefined;
    band?: boolean | undefined;
    map?: string | undefined;
    hero?: string | undefined;
    towers?: string[] | undefined;
}

/** /stats URL search */
export interface StatsSearch {
    season?: StatsSeason | undefined;
    /** one player's id */
    player?: string | undefined;
    /** a leaderboard range or "everyone" (default top 25) */
    players?: string | undefined;
    band?: true | undefined;
    /** "oasis" (both versions), "oasis:classic" or "oasis:reversed" */
    map?: string | undefined;
    /** "Quincy" (any variant) or "Quincy:Quincy_Cyber" */
    hero?: string | undefined;
    /** comma separated, ≤ 3 */
    towers?: string | undefined;
    view?: StatsView | undefined;
    /** minimum games for a row */
    min?: number | undefined;
    /** heroes and maps tables: one row per variant (skin, classic / reversed) */
    variants?: true | undefined;
    /** strats table: the 3 towers only */
    towersOnly?: true | undefined;
}
