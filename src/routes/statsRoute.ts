import { createRoute } from '@tanstack/react-router';
import { MATCH_SORT_DEFAULT, MATCH_SORTS } from '@/config/match';
import { LEADERBOARD_RANGES, parseExclude } from '@/config/ranges';
import {
    STATS_AGAINST_DEFAULT,
    STATS_MIN_DEFAULT,
    STATS_MIN_GAMES,
    STATS_MIN_PICK,
    STATS_MIN_PICK_DEFAULT,
    STATS_PLAYER_VIEWS,
    STATS_PLAYERS_DEFAULT,
    STATS_VIEW_DEFAULT,
    STATS_VIEWS,
} from '@/config/stats';
import Stats from '@/pages/Stats';
import type { StatsSearch } from '@/types/stats';
import { parseFlag, parseOff, parseOption, parseSeason, parseUserId } from '@/utils/search';
import { rootRoute } from './rootRoute';

/** "Druid,Alchemist": tower ids only. */
const parseTowerList = (value: unknown, max: number) =>
    typeof value === 'string' && /^[A-Za-z0-9_,]+$/.test(value.trim())
        ? value.trim().slice(0, max)
        : undefined;

/** "Quincy,Adora:Adora_Fateweaver": heroes, any variant or one. */
const parseHeroList = (value: unknown, max: number) =>
    typeof value === 'string' && /^[A-Za-z0-9_:,]+$/.test(value.trim())
        ? value.trim().slice(0, max)
        : undefined;

/** "oasis,dino:reversed": map keys, maybe one version. */
const parseMapList = (value: unknown, max: number) =>
    typeof value === 'string' && /^[a-z0-9:,]+$/.test(value.trim())
        ? value.trim().slice(0, max)
        : undefined;

/** "Quincy" (any variant) or "Quincy:Quincy_Cyber". */
const parseHeroPick = (value: unknown) =>
    typeof value === 'string' && /^[A-Za-z0-9_]+(:[A-Za-z0-9_]+)?$/.test(value)
        ? value.slice(0, 82)
        : undefined;

function validateSearch(search: Record<string, unknown>): StatsSearch {
    const sides = parseFlag(search.sides);
    const player = parseUserId(search.player);
    const players = player
        ? undefined
        : parseOption(
              search.players != null ? String(search.players) : undefined,
              LEADERBOARD_RANGES.map((r) => r.value),
              STATS_PLAYERS_DEFAULT,
          );
    // who they played: one player, or a range (default every HoM player)
    const second = parseUserId(search.player2);
    const player2 = second === player ? undefined : second;
    const players2 = player2
        ? undefined
        : parseOption(
              search.players2 != null ? String(search.players2) : undefined,
              LEADERBOARD_RANGES.map((r) => r.value),
          );
    const season = parseSeason(search.season, true);
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
        map:
            typeof search.map === 'string' && /^[a-z0-9]+(:(classic|reversed))?$/.test(search.map)
                ? search.map
                : undefined,
        hero: parseHeroPick(search.hero),
        towers: parseTowerList(search.towers, 130),
        // the opponent's loadout: only with the sides filtered separately
        ...(sides && {
            sides,
            hero2: parseHeroPick(search.hero2),
            towers2: parseTowerList(search.towers2, 130),
            exHeroes2: parseHeroList(search.exHeroes2, 300),
            exTowers2: parseTowerList(search.exTowers2, 300),
        }),
        exHeroes: parseHeroList(search.exHeroes, 300),
        exTowers: parseTowerList(search.exTowers, 300),
        exMaps: parseMapList(search.exMaps, 300),
        view: parseOption(
            search.view,
            [...STATS_VIEWS.map((v) => v.value), ...STATS_PLAYER_VIEWS],
            STATS_VIEW_DEFAULT,
        ),
        min: parseOption(Number(search.min), STATS_MIN_GAMES, STATS_MIN_DEFAULT),
        pick: parseOption(Number(search.pick), STATS_MIN_PICK, STATS_MIN_PICK_DEFAULT),
        splitMaps: parseOff(search.splitMaps) ?? parseOff(search.variants),
        splitHeroes: parseOff(search.splitHeroes) ?? parseOff(search.variants),
        towersOnly: parseFlag(search.towersOnly),
        sort: parseOption(search.sort, MATCH_SORTS, MATCH_SORT_DEFAULT),
    };
}

export const statsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/stats',
    validateSearch,
    component: Stats,
});
