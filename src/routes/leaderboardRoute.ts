import { createRoute } from '@tanstack/react-router';
import {
    LEADERBOARD_DEFAULT_SIZE,
    LEADERBOARD_MIN_GAMES,
    LEADERBOARD_PAGE_SIZES,
    LEADERBOARD_SORT_DEFAULT,
    LEADERBOARD_SORTS,
} from '@/config/leaderboard';
import { leaderboardQueryOptions } from '@/hooks/queries/useLeaderboard';
import Leaderboard from '@/pages/Leaderboard';
import type { LeaderboardSearch } from '@/types/leaderboard';
import { parseFlag, parseOption } from '@/utils/search';
import { rootRoute } from './rootRoute';

function validateSearch(search: Record<string, unknown>): LeaderboardSearch {
    const page = Number(search.page);
    // not trimmed: the search box shows it while typing
    const q =
        typeof search.q === 'string' || typeof search.q === 'number'
            ? String(search.q).slice(0, 64)
            : '';
    return {
        page: Number.isInteger(page) && page > 1 ? page : undefined,
        size: parseOption(Number(search.size), LEADERBOARD_PAGE_SIZES, LEADERBOARD_DEFAULT_SIZE),
        q: q.trim() ? q : undefined,
        sort: parseOption(search.sort, LEADERBOARD_SORTS, LEADERBOARD_SORT_DEFAULT),
        reverse: parseFlag(search.reverse),
        min: parseOption(Number(search.min), LEADERBOARD_MIN_GAMES, 0),
    };
}

export const leaderboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/leaderboard/$season',
    params: {
        parse: ({ season }) => ({ season: Number(season) }),
        stringify: ({ season }) => ({ season: String(season) }),
    },
    validateSearch,
    loader: ({ context, params }) => {
        void context.queryClient.prefetchQuery(leaderboardQueryOptions(params.season));
    },
    component: Leaderboard,
});
