import {
    createRouter,
    createRootRouteWithContext,
    createRoute,
    Outlet,
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import Header from '@/components/header/Header';
import Footer from '@/components/footer/Footer';
import {
    LEADERBOARD_DEFAULT_SIZE,
    LEADERBOARD_MIN_GAMES,
    LEADERBOARD_PAGE_SIZES,
} from '@/config/leaderboard';
import { PROFILE_MATCH_AMOUNTS, PROFILE_MATCH_DEFAULT } from '@/config/profile';
import { leaderboardQueryOptions } from '@/hooks/useLeaderboard';
import { profileQueryOptions } from '@/hooks/useProfile';
import { seasonStatsQueryOptions } from '@/hooks/useSeasonStats';
import Compare from '@/pages/Compare';
import Home from '@/pages/Home';
import Leaderboard from '@/pages/Leaderboard';
import LeaderboardIndex from '@/pages/LeaderboardIndex';
import MatchesHistory from '@/pages/MatchesHistory';
import NotFound from '@/pages/NotFound';
import User from '@/pages/User';
import { queryClient } from '@/queryClient';
import type { CompareSearch } from '@/types/compare';
import {
    LEADERBOARD_SORTS,
    type LeaderboardSearch,
    type LeaderboardSort,
} from '@/types/leaderboard';
import { MATCH_SORTS, type MatchesQuery, type MatchSort } from '@/types/match';
import type { UserSearch } from '@/types/profile';
import { COMPARE_RANGE_DEFAULT, COMPARE_RANGES } from './config/compare';

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: () => (
        <>
            <Header />
            <div className='site-main'>
                <Outlet />
            </div>
            <Footer />
        </>
    ),
    notFoundComponent: NotFound,
});

const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
});

const leaderboardIndexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/leaderboard',
    component: LeaderboardIndex,
});

const leaderboardRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/leaderboard/$season',
    params: {
        parse: ({ season }) => ({ season: Number(season) }),
        stringify: ({ season }) => ({ season: String(season) }),
    },
    validateSearch: (search: Record<string, unknown>): LeaderboardSearch => {
        const page = Number(search.page);
        const size = Number(search.size);
        const sort = search.sort as LeaderboardSort;
        const min = Number(search.min);
        const q =
            typeof search.q === 'string' || typeof search.q === 'number'
                ? String(search.q).slice(0, 40)
                : '';
        return {
            page: Number.isInteger(page) && page > 1 ? page : undefined,
            size:
                LEADERBOARD_PAGE_SIZES.includes(size) && size !== LEADERBOARD_DEFAULT_SIZE
                    ? size
                    : undefined,
            q: q.trim() ? q : undefined,
            sort: LEADERBOARD_SORTS.includes(sort) && sort !== 'rank' ? sort : undefined,
            min: LEADERBOARD_MIN_GAMES.includes(min) && min > 0 ? min : undefined,
        };
    },
    loader: ({ context, params }) => {
        void context.queryClient.prefetchQuery(leaderboardQueryOptions(params.season));
    },
    component: Leaderboard,
});

const matchesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/matches-history',
    validateSearch: (search: Record<string, unknown>): MatchesQuery => {
        const text = (value: unknown, max = 40) =>
            typeof value === 'string' && value.trim() !== ''
                ? value.trim().slice(0, max)
                : undefined;
        const season = Number(search.season);
        const sort = search.sort as MatchSort;
        return {
            season:
                search.season != null && Number.isInteger(season) && season >= 0
                    ? season
                    : undefined,
            player: text(search.player),
            heroes: text(search.heroes, 120),
            towers: text(search.towers, 200),
            map: text(search.map),
            sort: MATCH_SORTS.includes(sort) && sort !== 'newest' ? sort : undefined,
            sameSide: search.sameSide === true || search.sameSide === 'true' ? true : undefined,
        };
    },
    component: MatchesHistory,
});

const userRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/user/$userId',
    validateSearch: (search: Record<string, unknown>): UserSearch => {
        const matches = Number(search.matches);
        return {
            matches:
                PROFILE_MATCH_AMOUNTS.includes(matches) && matches !== PROFILE_MATCH_DEFAULT
                    ? matches
                    : undefined,
        };
    },
    loader: ({ context, params, preload }) => {
        void context.queryClient.prefetchQuery(profileQueryOptions(params.userId));
        if (!preload)
            void context.queryClient.prefetchQuery(seasonStatsQueryOptions(params.userId));
    },
    component: User,
});

const compareRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/user/$userId/compare',
    validateSearch: (search: Record<string, unknown>): CompareSearch => {
        const season = Number(search.season);
        const vs = typeof search.vs === 'string' && /^[a-z0-9]{8,64}$/i.test(search.vs);
        const range = search.range != null ? String(search.range) : '';
        const customRange =
            !vs && range !== COMPARE_RANGE_DEFAULT && COMPARE_RANGES.some((r) => r.value === range);
        return {
            season:
                search.season === 'all'
                    ? 'all'
                    : search.season != null && Number.isInteger(season) && season >= 0
                      ? season
                      : undefined,
            vs: vs ? (search.vs as string) : undefined,
            range: customRange ? range : undefined,
            band:
                customRange && [true, 1, '1', 'true'].includes(search.band as never)
                    ? true
                    : undefined,
        };
    },
    component: Compare,
});

const routeTree = rootRoute.addChildren([
    homeRoute,
    leaderboardIndexRoute,
    leaderboardRoute,
    matchesRoute,
    userRoute,
    compareRoute,
]);

export const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreload: 'intent',
    defaultPreloadDelay: 150,
    defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
