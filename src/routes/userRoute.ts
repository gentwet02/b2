import { createRoute, notFound } from '@tanstack/react-router';
import {
    PROFILE_MATCH_AMOUNTS,
    PROFILE_MATCH_DEFAULT,
    PROFILE_SEASON_AMOUNTS,
    PROFILE_SEASON_DEFAULT,
} from '@/config/profile';
import { profileQueryOptions } from '@/hooks/queries/useProfile';
import { seasonStatsQueryOptions } from '@/hooks/queries/useSeasonStats';
import NotFound from '@/pages/not-found/NotFound';
import User from '@/pages/user/User';
import type { UserSearch } from '@/types/profile';
import { onlyParsed, parseOff, parseOption, parseUserId } from '@/utils/search';
import { rootRoute } from './rootRoute';

function validateSearch(search: Record<string, unknown>): UserSearch {
    return {
        matches: parseOption(Number(search.matches), PROFILE_MATCH_AMOUNTS, PROFILE_MATCH_DEFAULT),
        seasons: parseOption(
            Number(search.seasons),
            PROFILE_SEASON_AMOUNTS,
            PROFILE_SEASON_DEFAULT,
        ),
        splitMaps: parseOff(search.splitMaps),
        splitHeroes: parseOff(search.splitHeroes),
    };
}

export const userRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/user/$userId',
    validateSearch,
    search: { middlewares: [onlyParsed(validateSearch)] },
    loader: ({ context, params, preload }) => {
        // not a Ninja Kiwi id: the not found page, without asking the server (thrown here, not
        // in beforeLoad: from there the router shows the root's not found page, without the layout)
        if (!parseUserId(params.userId)) throw notFound();
        void context.queryClient.prefetchQuery(profileQueryOptions(params.userId));
        // hovering a link only prefetches the profile, opening it loads the season too
        if (!preload)
            void context.queryClient.prefetchQuery(seasonStatsQueryOptions(params.userId));
    },
    component: User,
    notFoundComponent: NotFound,
});
