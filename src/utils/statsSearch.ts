import { MATCH_SORT_DEFAULT, MATCH_SORTS } from '@/config/match';
import { LEADERBOARD_RANGES, parseExclude, validExclude } from '@/config/ranges';
import {
    STATS_AGAINST_DEFAULT,
    STATS_LIST_MAX,
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
import type { CompareParams, CompareSideParams } from '@/services/api/compare';
import type { CompareSideKey } from '@/types/compare';
import type { SeasonQuery } from '@/types/season';
import type { SideState, StatsParams, StatsSearch, StatsView } from '@/types/stats';
import { groupName } from '@/utils/compareTitles';
import {
    joinList,
    parseClanId,
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
import { clanTag, listsRange, parseSideList, playerTag, rangeTag } from '@/utils/sideList';

const RANGES = LEADERBOARD_RANGES.map((r) => r.value);

/**
 * The /stats URL, read. Every rule of the page's URL lives here: defaults are left out,
 * a range's `exclude` must be a smaller range, a player or a clan can't play themselves, a side
 * is a list before one player, one player before a clan and a clan before a range, the
 * opponent's loadout only goes with `sides`... The route runs it on the URL it opens and, through its search
 * middleware, on every link and navigation to the page, so a change only gives what changes.
 */
export function parseStatsSearch(search: Record<string, unknown>): StatsSearch {
    const sides = parseFlag(search.sides);
    // several players, clans and ranges together: instead of the side's one
    const given = parseSideList(search.list, STATS_LIST_MAX);
    const player = given ? undefined : parseUserId(search.player);
    // who a side leaves out: nobody to take out of one player
    const leftOut = player
        ? undefined
        : parseSideList(search.not, STATS_LIST_MAX, { everyone: false });
    // players left out of one clan or range: a list of that one
    const listed =
        given ??
        (leftOut &&
            impliedList(search.clan, search.players, search.exclude, STATS_PLAYERS_DEFAULT));
    const clan = player || listed ? undefined : parseClanId(search.clan);
    // the other side's one player or clan isn't in a list
    const given2 = parseSideList(search.list2, STATS_LIST_MAX, {
        skip: player ? playerTag(player) : clan ? clanTag(clan) : undefined,
    });
    const players =
        player || clan || listed
            ? undefined
            : parseOption(
                  search.players != null ? String(search.players) : undefined,
                  RANGES,
                  STATS_PLAYERS_DEFAULT,
              );
    // who they played: one player, a clan, or a range
    const second = given2 ? undefined : parseUserId(search.player2);
    const player2 = second === player ? undefined : second;
    const leftOut2 = player2
        ? undefined
        : parseSideList(search.not2, STATS_LIST_MAX, { everyone: false });
    const list2 =
        given2 ??
        (leftOut2 &&
            impliedList(search.clan2, search.players2, search.exclude2, STATS_AGAINST_DEFAULT));
    const secondClan = player2 || list2 ? undefined : parseClanId(search.clan2);
    const clan2 = secondClan === clan ? undefined : secondClan;
    const list =
        listed &&
        parseSideList(listed, STATS_LIST_MAX, {
            skip: player2 ? playerTag(player2) : clan2 ? clanTag(clan2) : undefined,
        });
    const players2 =
        player2 || clan2 || list2
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
        clan,
        players,
        exclude:
            player || clan || listed
                ? undefined
                : parseExclude(players ?? STATS_PLAYERS_DEFAULT, search.exclude, search.band),
        list,
        not: list ? leftOut : undefined,
        player2,
        clan2,
        players2,
        exclude2:
            player2 || clan2 || list2
                ? undefined
                : parseExclude(players2 ?? STATS_AGAINST_DEFAULT, search.exclude2, undefined),
        list2,
        not2: list2 ? leftOut2 : undefined,
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

/**
 * Players left out of a side that is one clan or one range: the list that clan or range
 * makes alone (the default range without either), so the side is a list like any other.
 */
function impliedList(clan: unknown, players: unknown, exclude: unknown, fallback: string) {
    const clanId = parseClanId(clan);
    if (clanId) return clanTag(clanId);
    const range = RANGES.find((r) => r === String(players)) ?? fallback;
    return rangeTag(range, validExclude(range, exclude));
}

/**
 * What each side is picking: "One player" or "Clan" chosen, the player or clan not yet
 * (false: nothing).
 */
export type Picking = Record<CompareSideKey, 'player' | 'clan' | false>;

/** A side's mode: what the URL holds, else what is being picked, else a range. */
const sideMode = (
    player: string | undefined,
    clan: string | undefined,
    picking: Picking[CompareSideKey],
) => (player ? 'player' : clan ? 'clan' : picking || 'top');

/** Both sides, defaults filled in. */
export function statsSides(search: StatsSearch, picking: Picking) {
    const pickerA = sideMode(search.player, search.clan, picking.a);
    const listA = splitList(search.list);
    const a: SideState = {
        mode: listA.length ? 'list' : pickerA,
        picker: pickerA,
        player: search.player,
        clan: search.clan,
        range: search.players ?? STATS_PLAYERS_DEFAULT,
        exclude: search.exclude,
        list: listA,
        not: splitList(search.not),
    };
    const pickerB = sideMode(search.player2, search.clan2, picking.b);
    const listB = splitList(search.list2);
    const b: SideState = {
        mode: listB.length ? 'list' : pickerB,
        picker: pickerB,
        player: search.player2,
        clan: search.clan2,
        range: search.players2 ?? STATS_AGAINST_DEFAULT,
        exclude: search.exclude2,
        list: listB,
        not: splitList(search.not2),
    };
    return { a, b };
}

/** What a side is, as a list's first tag: its player, its clan (once picked) or its range. */
export function sideOwnTag(side: SideState) {
    if (side.mode === 'list') return undefined;
    if (side.mode === 'player') return side.player && playerTag(side.player);
    if (side.mode === 'clan') return side.clan && clanTag(side.clan);
    return rangeTag(side.range, side.exclude);
}

/** "+": the side's player, clan or range becomes a list of one, its picker free for another. */
export function listedSearch(key: CompareSideKey, tag: string): Partial<StatsSearch> {
    return key === 'a'
        ? { list: tag, player: undefined, clan: undefined, players: undefined, exclude: undefined }
        : {
              list2: tag,
              player2: undefined,
              clan2: undefined,
              players2: undefined,
              exclude2: undefined,
          };
}

/**
 * "×": the side's player, clan or range is left out of everyone, "All HoM players" the
 * list's first tag.
 */
export function leftOutSearch(key: CompareSideKey, tag: string): Partial<StatsSearch> {
    const everyone = listedSearch(key, rangeTag('all'));
    return key === 'a' ? { ...everyone, not: tag } : { ...everyone, not2: tag };
}

/** No range on the side: few enough games to list them (the server's rule). */
const isPicked = (side: SideState) =>
    side.mode === 'list' ? !listsRange(side.list) : side.mode !== 'top';

/** What a side still needs before anything can be asked: its player or its clan. */
export function sideMissing(side: SideState) {
    if (side.mode === 'player' && !side.player) return 'player';
    if (side.mode === 'clan' && !side.clan) return 'clan';
    return null;
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

/** A players tab's name: "Top 25 players", "All HoM players", "Clan members", "Listed players". */
function groupTab(side: SideState) {
    if (side.mode === 'list') return 'Listed players';
    return side.mode === 'clan' ? 'Clan members' : rangeTab(side.range, side.exclude);
}

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
    const tabA = groupTab(a);
    const tabB = groupTab(b);
    const groupA = a.mode !== 'player';
    const groupB = b.mode !== 'player';
    // the same name on both tabs (two clans, or a loadout filter tells them apart): name the
    // boxes too
    const twin = groupA && groupB && tabA === tabB;
    const tabs: StatsTabs['tabs'] = [
        ...STATS_VIEWS,
        ...(groupA
            ? [{ value: 'players' as const, label: twin && !sameRange ? `Players: ${tabA}` : tabA }]
            : []),
        ...(groupB && !sameRange
            ? [{ value: 'opponents' as const, label: twin ? `Against: ${tabB}` : tabB }]
            : []),
        // a range on both sides: too many games for a list
        ...(isPicked(a) || isPicked(b) ? [{ value: 'games' as const, label: 'Games' }] : []),
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
        clan: search.clan,
        players: a.range,
        exclude: search.exclude,
        list: search.list,
        not: search.not,
        player2: search.player2,
        clan2: search.clan2,
        players2: b.range,
        exclude2: search.exclude2,
        list2: search.list2,
        not2: search.not2,
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

function compareSide(side: SideState): CompareSideParams {
    if (side.mode !== 'list' && side.player) return { player: side.player };
    const not = joinList(side.not);
    if (side.list.length) return { list: side.list.join(','), not };
    if (side.clan) return { clan: side.clan, not };
    return { range: side.range, exclude: side.exclude, not };
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
        a: compareSide(a),
        b: compareSide(b),
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
        clan: search.clan2,
        players: b.range,
        exclude: search.exclude2,
        list: search.list2,
        not: search.not2,
        player2: search.player,
        clan2: search.clan,
        players2: a.range,
        exclude2: search.exclude,
        list2: search.list,
        not2: search.not,
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
        ? {
              player: userId,
              clan: undefined,
              players: undefined,
              exclude: undefined,
              list: undefined,
              not: undefined,
          }
        : {
              player2: userId,
              clan2: undefined,
              players2: undefined,
              exclude2: undefined,
              list2: undefined,
              not2: undefined,
          };
}
