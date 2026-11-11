import type { ReactNode } from 'react';
import type { BaseApiResponse } from '@/types/api';
import type { ClanSideInfo } from '@/types/clan';
import type { CompareSideInfo, Labels, RankBounds } from '@/types/compare';
import type { HeroPick } from '@/types/hero';
import type { MapVariant } from '@/types/map';
import type { MatchSort, SideFilterOptions } from '@/types/match';
import type { RecordRow, Wld } from '@/types/record';
import type { GroupMode, SeasonQuery, SeasonScope } from '@/types/season';
import type { SplitSearch } from '@/types/variants';

/** The picks tables, then the players tabs: side 1's players, side 2's, the latest games. */
export type StatsView = 'heroes' | 'towers' | 'loadouts' | 'maps' | 'players' | 'opponents' | 'games';

/** What a side is: a range of each leaderboard, one player, or a clan. */
export type SideMode = GroupMode;

/** One item of a side's list: a player, a clan, or a range of each leaderboard. */
export type SideItem =
    | { kind: 'player'; id: string }
    | { kind: 'clan'; id: string }
    | { kind: 'top'; range: string; exclude: string | undefined };

/** What a list's picker holds until it is counted ("+") or left out ("×"). */
export interface SideDraft {
    player?: string | undefined;
    clan?: string | undefined;
    range: string;
    exclude: string | undefined;
}

/** What a side shows, defaults filled in. */
export interface SideState {
    /** what the side is; 'list': several players, clans and ranges together */
    mode: SideMode | 'list';
    /** the picker shown: the side's own mode, or what a list adds next */
    picker: SideMode;
    player: string | undefined;
    clan: string | undefined;
    range: string;
    exclude: string | undefined;
    /** the list's tags, "p:<id>", "c:<id>", "r:t50-t10" (none: one player, clan or range) */
    list: string[];
    /** the tags left out of the list (none without a list) */
    not: string[];
}

/** A hero base, a tower, a loadout key ("Quincy|Alchemist,Druid,Ninja") or a map key. */
export type StatsRow = RecordRow;

export interface StatsMapRow extends StatsRow {
    /** the group's games on that map, focus or not */
    total: number;
}

export interface StatsOption {
    key: string;
    count: number;
}

/** GET /stats */
export interface Stats extends BaseApiResponse {
    season: SeasonScope;
    seasonName: string;
    mode: GroupMode | 'list';
    /** leaderboard range (top mode) */
    players: string | null;
    /** the smaller range left out at the top */
    exclude?: string | null | undefined;
    band: boolean;
    player: { userId: string; name: string | null; alias: string | null } | null;
    /** side 1's clan (clan mode) */
    clan?: ClanSideInfo | null;
    /** side 1's players, clans and ranges (list mode) */
    list?: CompareSideInfo[] | null;
    /** who side 1 leaves out (null: nobody) */
    not?: CompareSideInfo[] | null;
    /** a player in both ranges counts on both sides */
    overlap?: boolean;
    /** only the games against them; null: anyone (older servers: missing) */
    against?: CompareSideInfo | null;
    filters: {
        map: { base: string; variant?: MapVariant } | null;
        hero: HeroPick | null;
        towers: string[];
        exHeroes?: HeroPick[];
        exTowers?: string[];
        exMaps?: { base: string; variant?: MapVariant }[];
    };
    maxExcluded?: { heroes: number; towers: number; maps: number };
    seasons: {
        seasonId: number;
        name: string;
        bounds: RankBounds | null;
        /** players counted that season */
        players: number | null;
        /** the opponents' ranks and count that season (against a range) */
        boundsAgainst?: RankBounds | null;
        opponents?: number | null;
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
    /** most played first */
    loadouts: StatsRow[];
    /** strats with the exact hero variant: "Quincy_Cyber|Alchemist,Druid,Ninja" */
    loadoutVariants: StatsRow[];
    /** strats without the hero: "Alchemist,Druid,Ninja" */
    trios: StatsRow[];
    /** the focus on every map (the map filter is ignored here) */
    maps: StatsMapRow[];
    /** classic and reversed apart: "oasis", "oasis:reversed" */
    mapVariants: StatsMapRow[];
    /** the opponents' heroes and towers (sides filtered separately) */
    options2?: SideFilterOptions | null;
    /** the opponent's loadout filter, as the server read it */
    filters2?: {
        hero: HeroPick | null;
        towers: string[];
        exHeroes?: HeroPick[];
        exTowers?: string[];
    } | null;
    /** heroes (with variants) and towers in the match filters' shape */
    options: SideFilterOptions & {
        /** base maps, with their classic / reversed games */
        maps: (StatsOption & { variants: { variant: MapVariant; count: number }[] })[];
    };
    labels: Labels & {
        /** raw hero → its base and portrait */
        variants: Record<string, { base: string; portrait: string | null }>;
    };
}

export interface StatsParams {
    season?: SeasonQuery | undefined;
    /** false: a player in both ranges counts only for the players counted */
    overlap?: boolean | undefined;
    player?: string | undefined;
    clan?: string | undefined;
    players?: string | undefined;
    exclude?: string | undefined;
    /** several players, clans and ranges together, as the URL's tags */
    list?: string | undefined;
    /** the players, clans and ranges left out, as the URL's tags */
    not?: string | undefined;
    /** who they played: one player, a clan, or a range (none: anyone) */
    player2?: string | undefined;
    clan2?: string | undefined;
    players2?: string | undefined;
    exclude2?: string | undefined;
    list2?: string | undefined;
    not2?: string | undefined;
    map?: string | undefined;
    hero?: string | undefined;
    towers?: string[] | undefined;
    /** exclusions, comma lists like the URL's */
    exHeroes?: string | undefined;
    exTowers?: string | undefined;
    exMaps?: string | undefined;
    /** the opponent's loadout (sides filtered separately) */
    hero2?: string | undefined;
    towers2?: string[] | undefined;
    exHeroes2?: string | undefined;
    exTowers2?: string | undefined;
    /** sides filtered separately: also the opponents' options */
    sides?: boolean | undefined;
}

/** /stats URL search */
export interface StatsSearch extends SplitSearch {
    season?: SeasonScope | undefined;
    /** with `season`, a range of seasons: the last one (either order) */
    seasonTo?: number | undefined;
    /** false: a player in both ranges counts only for the players counted */
    overlap?: false | undefined;
    /** one player's id */
    player?: string | undefined;
    /** or a clan's id */
    clan?: string | undefined;
    /** a leaderboard range (default top 25) */
    players?: string | undefined;
    /** a smaller range left out at the top */
    exclude?: string | undefined;
    /**
     * or several players, clans and ranges counted together: "p:<id>,c:<id>,r:t50-t10"
     * (it goes before the three above)
     */
    list?: string | undefined;
    /** players, clans and ranges left out of the list: "p:<id>,r:t10" (never a bare "r:all") */
    not?: string | undefined;
    /** only their games against one player… */
    player2?: string | undefined;
    /** …or against a clan… */
    clan2?: string | undefined;
    /** …or against a range of each leaderboard (default: every HoM player) */
    players2?: string | undefined;
    exclude2?: string | undefined;
    /** …or against several of those together */
    list2?: string | undefined;
    not2?: string | undefined;
    /** "oasis" (both versions), "oasis:classic" or "oasis:reversed" */
    map?: string | undefined;
    /** "Quincy" (any variant) or "Quincy:Quincy_Cyber" */
    hero?: string | undefined;
    /** comma separated, ≤ 3 */
    towers?: string | undefined;
    /** exclusions: loadouts without these heroes / with none of these towers, not these maps */
    exHeroes?: string | undefined;
    exTowers?: string | undefined;
    exMaps?: string | undefined;
    /** filter each side's loadout: the opponents' hero and towers below */
    sides?: true | undefined;
    hero2?: string | undefined;
    towers2?: string | undefined;
    exHeroes2?: string | undefined;
    exTowers2?: string | undefined;
    view?: StatsView | undefined;
    /** minimum games for a row */
    min?: number | undefined;
    /** minimum pick rate, in % */
    pick?: number | undefined;
    /** strats table: the 3 towers only */
    towersOnly?: true | undefined;
    /** games tab: the order of the games (default newest) */
    sort?: MatchSort | undefined;
}

/** The tabs bar's state: the tabs that fit the sides, the one shown, and its options. */
export interface StatsViewState {
    tabs: { value: StatsView; label: string }[];
    view: StatsView;
    /** minimum games for a row */
    min: number;
    /** minimum pick rate, in % */
    minPick: number;
    /** strats table: the 3 towers only */
    towersOnly: boolean;
    /** games tab: their order */
    sort: MatchSort;
}

/** One of the stats tables: its rows and how they read, sort and focus. */
export interface StatsTableSpec {
    id: string;
    rows: StatsRow[];
    title: string;
    render: (r: StatsRow) => ReactNode;
    /** the row's name, for the A–Z sort */
    name: (r: StatsRow) => string;
    /** the filters "Focus →" sets, null: already focused */
    focus: (r: StatsRow) => Partial<StatsSearch> | null;
    /** what a row is ("strat"): the table's rows counted under it */
    counted?: string;
}
