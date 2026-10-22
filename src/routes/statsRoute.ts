import { createRoute } from '@tanstack/react-router';
import { LEADERBOARD_RANGES, parseExclude } from '@/config/ranges';
import {
    STATS_MIN_DEFAULT,
    STATS_MIN_GAMES,
    STATS_MIN_PICK,
    STATS_MIN_PICK_DEFAULT,
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

function validateSearch(search: Record<string, unknown>): StatsSearch {
    const player = parseUserId(search.player);
    const players = player
        ? undefined
        : parseOption(
              search.players != null ? String(search.players) : undefined,
              LEADERBOARD_RANGES.map((r) => r.value),
              STATS_PLAYERS_DEFAULT,
          );
    return {
        season: parseSeason(search.season, true),
        player,
        players,
        exclude: player
            ? undefined
            : parseExclude(players ?? STATS_PLAYERS_DEFAULT, search.exclude, search.band),
        map:
            typeof search.map === 'string' && /^[a-z0-9]+(:(classic|reversed))?$/.test(search.map)
                ? search.map
                : undefined,
        hero:
            typeof search.hero === 'string' && /^[A-Za-z0-9_]+(:[A-Za-z0-9_]+)?$/.test(search.hero)
                ? search.hero.slice(0, 82)
                : undefined,
        towers: parseTowerList(search.towers, 130),
        view: parseOption(
            search.view,
            STATS_VIEWS.map((v) => v.value),
            STATS_VIEW_DEFAULT,
        ),
        min: parseOption(Number(search.min), STATS_MIN_GAMES, STATS_MIN_DEFAULT),
        pick: parseOption(Number(search.pick), STATS_MIN_PICK, STATS_MIN_PICK_DEFAULT),
        variants: parseOff(search.variants),
        towersOnly: parseFlag(search.towersOnly),
    };
}

export const statsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/stats',
    validateSearch,
    component: Stats,
});
