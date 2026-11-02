import { createRoute } from '@tanstack/react-router';
import { MATCH_SORT_DEFAULT, MATCH_SORTS } from '@/config/match';
import MatchesHistory from '@/pages/matches-history/MatchesHistory';
import type { MatchesQuery } from '@/types/match';
import {
    onlyParsed,
    parseExclusions,
    parseFlag,
    parseHeroList,
    parseMapKey,
    parseOption,
    parseSeason,
    parseText,
    parseTowerList,
} from '@/utils/search';
import { rootRoute } from './rootRoute';

function validateSearch(search: Record<string, unknown>): MatchesQuery {
    return {
        season: parseSeason(search.season, true),
        player: parseText(search.player, 64),
        heroes: parseHeroList(search.heroes, 120),
        towers: parseTowerList(search.towers, 200),
        map: parseMapKey(search.map),
        sort: parseOption(search.sort, MATCH_SORTS, MATCH_SORT_DEFAULT),
        sameSide: parseFlag(search.sameSide),
        player2: parseText(search.player2, 64),
        heroes2: parseHeroList(search.heroes2, 60),
        towers2: parseTowerList(search.towers2, 100),
        allNames: parseFlag(search.allNames),
        ...parseExclusions(search),
    };
}

export const matchesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/matches-history',
    validateSearch,
    search: { middlewares: [onlyParsed(validateSearch)] },
    component: MatchesHistory,
});
