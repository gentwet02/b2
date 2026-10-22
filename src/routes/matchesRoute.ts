import { createRoute } from '@tanstack/react-router';
import { MATCH_SORT_DEFAULT, MATCH_SORTS } from '@/config/match';
import MatchesHistory from '@/pages/MatchesHistory';
import type { MatchesQuery } from '@/types/match';
import { parseOption, parseSeason, parseText } from '@/utils/search';
import { rootRoute } from './rootRoute';

function validateSearch(search: Record<string, unknown>): MatchesQuery {
    return {
        season: parseSeason(search.season),
        player: parseText(search.player, 64),
        heroes: parseText(search.heroes, 120),
        towers: parseText(search.towers, 200),
        map: parseText(search.map),
        sort: parseOption(search.sort, MATCH_SORTS, MATCH_SORT_DEFAULT),
        sameSide: search.sameSide === true || search.sameSide === 'true' ? true : undefined,
        player2: parseText(search.player2, 64),
        heroes2: parseText(search.heroes2, 60),
        towers2: parseText(search.towers2, 100),
        allNames: search.allNames === true || search.allNames === 'true' ? true : undefined,
    };
}

export const matchesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/matches-history',
    validateSearch,
    component: MatchesHistory,
});
