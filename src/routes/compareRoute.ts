import { createRoute } from '@tanstack/react-router';
import { COMPARE_RANGE_DEFAULT } from '@/config/compare';
import { LEADERBOARD_RANGES, parseExclude } from '@/config/ranges';
import Compare from '@/pages/Compare';
import type { CompareSearch } from '@/types/compare';
import { parseOff, parseOption, parseSeason, parseUserId } from '@/utils/search';
import { rootRoute } from './rootRoute';

function validateSearch(search: Record<string, unknown>): CompareSearch {
    const vs = parseUserId(search.vs);
    // a range only without an opponent
    const range = vs
        ? undefined
        : parseOption(
              search.range != null ? String(search.range) : undefined,
              LEADERBOARD_RANGES.map((r) => r.value),
              COMPARE_RANGE_DEFAULT,
          );
    return {
        season: parseSeason(search.season, true),
        vs,
        range,
        exclude: vs
            ? undefined
            : parseExclude(range ?? COMPARE_RANGE_DEFAULT, search.exclude, search.band),
        splitMaps: parseOff(search.splitMaps),
        splitHeroes: parseOff(search.splitHeroes),
    };
}

export const compareRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/user/$userId/compare',
    validateSearch,
    component: Compare,
});
