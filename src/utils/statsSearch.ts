import { MATCH_SORT_DEFAULT, MATCH_SORTS } from '@/config/match';
import { LEADERBOARD_RANGES, parseExclude } from '@/config/ranges';
import {
    STATS_AGAINST_DEFAULT,
    STATS_MAX_TOWERS,
    STATS_MIN_DEFAULT,
    STATS_MIN_GAMES,
    STATS_MIN_PICK,
    STATS_MIN_PICK_DEFAULT,
    STATS_PLAYER_VIEWS,
    STATS_PLAYERS_DEFAULT,
    STATS_VIEW_DEFAULT,
    STATS_VIEWS,
} from '@/config/stats';
import type { CompareParams } from '@/services/api/compare';
import type { CompareSideKey } from '@/types/compare';
import type { SeasonQuery } from '@/types/season';
import type { SideState, StatsParams, StatsSearch, StatsView } from '@/types/stats';
import { groupName } from '@/utils/compareTitles';
import {
    parseExclusions,
    parseFlag,
    parseHeroPick,
    parseMapKey,
    parseOff,
    parseOption,
    parseSeason,
    parseTowerList,
    parseUserId,
    splitList,
} from '@/utils/search';

const RANGES = LEADERBOARD_RANGES.map((r) => r.value);

/**
 * The /stats URL, read. Every rule of the page's URL lives here: defaults are left out,
 * a range's `exclude` must be a smaller range, a player can't play themselves, the opponent's
 * loadout only goes with `sides`... The route runs it on the URL it opens and, through its search
 * middleware, on every link and navigation to the page, so a change only gives what changes.
 */
export function parseStatsSearch(search: Record<string, unknown>): StatsSearch {
    const sides = parseFlag(search.sides);
    const player = parseUserId(search.player);
    const players = player
        ? undefined
        : parseOption(
              search.players != null ? String(search.players) : undefined,
              RANGES,
              STATS_PLAYERS_DEFAULT,
          );
    // who they played: one player, or a range
    const second = parseUserId(search.player2);
    const player2 = second === player ? undefined : second;
    const players2 = player2
        ? undefined
        : parseOption(
              search.players2 != null ? String(search.players2) : undefined,
              RANGES,
              STATS_AGAINST_DEFAULT,
          );
    const season = parseSeason(search.season, true);
    const { exHeroes, exTowers, exMaps, exHeroes2, exTowers2 } = parseExclusions(search);
    return {
        season,
        // a range of seasons: not with "all"
        seasonTo: season === 'all' ? undefined : parseSeason(search.seasonTo),
        overlap: parseOff(search.overlap),
        player,
        players,
        exclude: player
            ? undefined
            : parseExclude(players ?? STATS_PLAYERS_DEFAULT, search.exclude, search.band),
        player2,
        players2,
        exclude2: player2
            ? undefined
            : parseExclude(players2 ?? STATS_AGAINST_DEFAULT, search.exclude2, undefined),
        map: parseMapKey(search.map),
        hero: parseHeroPick(search.hero),
        towers: parseTowerList(search.towers, 130),
        // the opponent's loadout: only with the sides filtered separately
        ...(sides && {
            sides,
            hero2: parseHeroPick(search.hero2),
            towers2: parseTowerList(search.towers2, 130),
            exHeroes2,
            exTowers2,
        }),
        exHeroes,
        exTowers,
        exMaps,
        view: parseOption(
            search.view,
            [...STATS_VIEWS.map((v) => v.value), ...STATS_PLAYER_VIEWS],
            STATS_VIEW_DEFAULT,
        ),
        min: parseOption(Number(search.min), STATS_MIN_GAMES, STATS_MIN_DEFAULT),
        pick: parseOption(Number(search.pick), STATS_MIN_PICK, STATS_MIN_PICK_DEFAULT),
        splitMaps: parseOff(search.splitMaps) === false ? false : parseOff(search.variants),
        splitHeroes: parseOff(search.splitHeroes) === false ? false : parseOff(search.variants),
        towersOnly: parseFlag(search.towersOnly),
        sort: parseOption(search.sort, MATCH_SORTS, MATCH_SORT_DEFAULT),
    };
}

/** Which side is being picked ("One player" chosen, the player not yet). */
export type Picking = Record<CompareSideKey, boolean>;

/** Both sides, defaults filled in. */
export function statsSides(search: StatsSearch, picking: Picking) {
    const a: SideState = {
        mode: search.player || picking.a ? 'player' : 'top',
        player: search.player,
        range: search.players ?? STATS_PLAYERS_DEFAULT,
        exclude: search.exclude,
    };
    const b: SideState = {
        mode: search.player2 || picking.b ? 'player' : 'top',
        player: search.player2,
        range: search.players2 ?? STATS_AGAINST_DEFAULT,
        exclude: search.exclude2,
    };
    return { a, b };
}

/** The seasons counted: the one picked, or a range of them for the server. */
export function statsSeasonQuery(search: StatsSearch, liveSeason: number | undefined) {
    const from = search.season ?? liveSeason;
    const seasonQuery: SeasonQuery | undefined =
        typeof from === 'number' && search.seasonTo !== undefined && search.seasonTo !== from
            ? `${Math.min(from, search.seasonTo)}-${Math.max(from, search.seasonTo)}`
            : search.season;
    return { from, seasonQuery };
}

/** Side 1's towers focused (at most 3). */
export const focusedTowers = (search: StatsSearch) =>
    splitList(search.towers).slice(0, STATS_MAX_TOWERS);

/** A hero or tower filter on a side: the two sides' tables differ. */
export function isLoadoutFiltered(search: StatsSearch) {
    return (
        !!search.hero ||
        !!search.towers ||
        !!search.exHeroes ||
        !!search.exTowers ||
        (!!search.sides &&
            (!!search.hero2 || !!search.towers2 || !!search.exHeroes2 || !!search.exTowers2))
    );
}

/** A map, hero or towers focused: the summary of the focus shows. */
export function isFocused(search: StatsSearch) {
    return (
        !!search.map ||
        !!search.hero ||
        focusedTowers(search).length > 0 ||
        !!search.hero2 ||
        !!search.towers2
    );
}

/** A players tab's name: "Top 25 players", "All HoM players". */
function rangeTab(range: string, exclude: string | undefined) {
    const name = groupName({
        mode: 'top',
        userId: null,
        name: null,
        alias: null,
        range,
        exclude: exclude ?? null,
    });
    return /players$/i.test(name) ? name : `${name} players`;
}

export interface StatsTabs {
    tabs: { value: StatsView; label: string }[];
    /** the tab shown: the one asked for when the sides have it */
    view: StatsView;
    /** one of the picks tables (from /stats), not a players one (from /compare) */
    picksView: boolean;
    /** both sides the same range, unfiltered: one players table is enough */
    sameRange: boolean;
}

/** The tabs: the picks tables, then the players ones that fit the sides. */
export function statsTabs(a: SideState, b: SideState, search: StatsSearch): StatsTabs {
    const sameRange =
        a.mode === 'top' &&
        b.mode === 'top' &&
        a.range === b.range &&
        (a.exclude ?? '') === (b.exclude ?? '') &&
        !isLoadoutFiltered(search);
    const tabA = rangeTab(a.range, a.exclude);
    const tabB = rangeTab(b.range, b.exclude);
    // the same name on both tabs (a loadout filter tells them apart): name the boxes too
    const twin = a.mode === 'top' && b.mode === 'top' && tabA === tabB;
    const tabs: StatsTabs['tabs'] = [
        ...STATS_VIEWS,
        ...(a.mode === 'top'
            ? [{ value: 'players' as const, label: twin && !sameRange ? `Players: ${tabA}` : tabA }]
            : []),
        ...(b.mode === 'top' && !sameRange
            ? [{ value: 'opponents' as const, label: twin ? `Against: ${tabB}` : tabB }]
            : []),
        ...(a.mode === 'player' || b.mode === 'player'
            ? [{ value: 'games' as const, label: 'Games' }]
            : []),
    ];
    // a link to the opponents' table lands on the one table there is
    const asked =
        sameRange && search.view === 'opponents' ? 'players' : (search.view ?? STATS_VIEW_DEFAULT);
    const view = tabs.some((t) => t.value === asked) ? asked : STATS_VIEW_DEFAULT;
    return { tabs, view, picksView: STATS_VIEWS.some((t) => t.value === view), sameRange };
}

/** What /stats is asked: the sides, the seasons and every filter. */
export function statsParamsOf(
    search: StatsSearch,
    a: SideState,
    b: SideState,
    seasonQuery: SeasonQuery | undefined,): StatsParams {
    return {
        season: seasonQuery,
        overlap: search.overlap !== false,
        player: search.player,
        players: a.range,
        exclude: search.exclude,
        player2: search.player2,
        players2: b.range,
        exclude2: search.exclude2,
        map: search.map,
        hero: search.hero,
        towers: focusedTowers(search),
        exHeroes: search.exHeroes,
        exTowers: search.exTowers,
        exMaps: search.exMaps,
        ...(search.sides && {
            sides: true,
            hero2: search.hero2,
            towers2: splitList(search.towers2).slice(0, STATS_MAX_TOWERS),
            exHeroes2: search.exHeroes2,
            exTowers2: search.exTowers2,
        }),
    };
}

/** What /compare is asked: the same sides and filters. */
export function compareParamsOf(
    search: StatsSearch,
    a: SideState,
    b: SideState,
    seasonQuery: SeasonQuery | undefined,): CompareParams {
    return {
        season: seasonQuery,
        overlap: search.overlap !== false,
        a: a.player ? { player: a.player } : { range: a.range, exclude: a.exclude },
        b: b.player ? { player: b.player } : { range: b.range, exclude: b.exclude },
        filters: {
            map: search.map,
            exMaps: search.exMaps,
            hero: search.hero,
            towers: search.towers,
            exHeroes: search.exHeroes,
            exTowers: search.exTowers,
            ...(search.sides && {
                hero2: search.hero2,
                towers2: search.towers2,
                exHeroes2: search.exHeroes2,
                exTowers2: search.exTowers2,
            }),
        },
    };
}

/** The sides swapped; each keeps its own loadout filter when they're filtered apart. */
export function swappedSearch(
    search: StatsSearch,
    a: SideState,
    b: SideState,): Partial<StatsSearch> {
    return {
        player: search.player2,
        players: b.range,
        exclude: search.exclude2,
        player2: search.player,
        players2: a.range,
        exclude2: search.exclude,
        ...(search.sides && {
            hero: search.hero2,
            towers: search.towers2,
            exHeroes: search.exHeroes2,
            exTowers: search.exTowers2,
            hero2: search.hero,
            towers2: search.towers,
            exHeroes2: search.exHeroes,
            exTowers2: search.exTowers,
        }),
    };
}

/** One player of a side's table alone takes the place of their side. */
export function drilledSearch(side: CompareSideKey, userId: string): Partial<StatsSearch> {
    return side === 'a'
        ? { player: userId, players: undefined, exclude: undefined }
        : { player2: userId, players2: undefined, exclude2: undefined };
}
