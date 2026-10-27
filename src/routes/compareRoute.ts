import { createRoute, redirect } from '@tanstack/react-router';
import { LEADERBOARD_RANGES, parseExclude } from '@/config/ranges';
import { parseOff, parseOption, parseSeason, parseUserId } from '@/utils/search';
import { rootRoute } from './rootRoute';

/**
 * The old head to head page (/user/<id>/compare?vs=…&range=…): the same games on the
 * stats page's head to head tab.
 */
export const userCompareRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/user/$userId/compare',
    validateSearch: (search: Record<string, unknown>) => search,
    beforeLoad: ({ params, search }) => {
        const vs = parseUserId(search.vs);
        // the old page's default was the top 10
        const range =
            parseOption(
                search.range != null ? String(search.range) : undefined,
                LEADERBOARD_RANGES.map((r) => r.value),
            ) ?? 't10';
        throw redirect({
            to: '/stats',
            search: {
                season: parseSeason(search.season, true),
                player: params.userId,
                player2: vs,
                players2: vs ? undefined : range,
                exclude2: vs ? undefined : parseExclude(range, search.exclude, search.band),
                // against one player: their games; against a range: its players
                view: vs ? 'games' : 'opponents',
                splitMaps: parseOff(search.splitMaps),
                splitHeroes: parseOff(search.splitHeroes),
            },
            replace: true,
        });
    },
});
