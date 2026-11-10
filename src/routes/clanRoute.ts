import { createRoute, notFound } from '@tanstack/react-router';
import {
    PROFILE_MATCH_AMOUNTS,
    PROFILE_MATCH_DEFAULT,
    PROFILE_SEASON_AMOUNTS,
    PROFILE_SEASON_DEFAULT,
} from '@/config/profile';
import { clanQueryOptions } from '@/hooks/queries/useClan';
import Clan from '@/pages/clan/Clan';
import NotFound from '@/pages/not-found/NotFound';
import type { ClanSearch } from '@/types/clan';
import { onlyParsed, parseClanId, parseOption } from '@/utils/search';
import { rootRoute } from './rootRoute';

function validateSearch(search: Record<string, unknown>): ClanSearch {
    return {
        matches: parseOption(Number(search.matches), PROFILE_MATCH_AMOUNTS, PROFILE_MATCH_DEFAULT),
        seasons: parseOption(
            Number(search.seasons),
            PROFILE_SEASON_AMOUNTS,
            PROFILE_SEASON_DEFAULT,
        ),
    };
}

export const clanRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/clan/$clanId',
    validateSearch,
    search: { middlewares: [onlyParsed(validateSearch)] },
    loader: ({ context, params }) => {
        // not a clan id: the not found page, without asking the server (see userRoute for
        // why in the loader)
        if (!parseClanId(params.clanId)) throw notFound();
        void context.queryClient.prefetchQuery(clanQueryOptions(params.clanId));
    },
    component: Clan,
    notFoundComponent: NotFound,
});
