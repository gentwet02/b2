import type { ReactNode } from 'react';
import type { BaseApiResponse } from '@/types/api';
import type { Labels, RankBounds } from '@/types/compare';
import type { HeroPick } from '@/types/hero';
import type { MapVariant } from '@/types/map';
import type { SideFilterOptions } from '@/types/match';
import type { RecordRow, Wld } from '@/types/record';
import type { GroupMode, SeasonScope } from '@/types/season';

export type StatsView = 'heroes' | 'towers' | 'loadouts' | 'maps';

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
    mode: GroupMode;
    /** leaderboard range (top mode) */
    players: string | null;
    /** the smaller range left out at the top */
    exclude?: string | null | undefined;
    band: boolean;
    player: { userId: string; name: string | null; alias: string | null } | null;
    filters: {
        map: { base: string; variant?: MapVariant } | null;
        hero: HeroPick | null;
        towers: string[];
    };
    seasons: {
        seasonId: number;
        name: string;
        bounds: RankBounds | null;
        /** players counted that season */
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
    /** strats with the exact hero variant: "Quincy_Cyber|Alchemist,Druid,Ninja", at most 500 */
    loadoutVariants: StatsRow[];
    loadoutVariantCount: number;
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
        maps: (StatsOption & { variants: { variant: MapVariant; count: number }[] })[];
    };
    labels: Labels & {
        /** raw hero → its base and portrait */
        variants: Record<string, { base: string; portrait: string | null }>;
    };
}

export interface StatsParams {
    season?: SeasonScope | undefined;
    player?: string | undefined;
    players?: string | undefined;
    exclude?: string | undefined;
    map?: string | undefined;
    hero?: string | undefined;
    towers?: string[] | undefined;
}

/** /stats URL search */
export interface StatsSearch {
    season?: SeasonScope | undefined;
    /** one player's id */
    player?: string | undefined;
    /** a leaderboard range (default top 25) */
    players?: string | undefined;
    /** a smaller range left out at the top */
    exclude?: string | undefined;
    /** "oasis" (both versions), "oasis:classic" or "oasis:reversed" */
    map?: string | undefined;
    /** "Quincy" (any variant) or "Quincy:Quincy_Cyber" */
    hero?: string | undefined;
    /** comma separated, ≤ 3 */
    towers?: string | undefined;
    view?: StatsView | undefined;
    /** minimum games for a row */
    min?: number | undefined;
    /** minimum pick rate, in % */
    pick?: number | undefined;
    /** false: variants together in the heroes, strats and maps tables (split by default) */
    variants?: false | undefined;
    /** strats table: the 3 towers only */
    towersOnly?: true | undefined;
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
    pageSize?: number;
    /** rows sent / rows there are, and what they are */
    cut?: { total: number; noun: string };
}
