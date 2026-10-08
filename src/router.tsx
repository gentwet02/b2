import {
    createRouter,
    createRootRouteWithContext,
    createRoute,
    Outlet,
} from '@tanstack/react-router';
import type { QueryClient } from '@tanstack/react-query';
import { leaderboardQueryOptions } from '@/hooks/useLeaderboard';
import { profileQueryOptions } from '@/hooks/useProfile';
import { seasonStatsQueryOptions } from '@/hooks/useSeasonStats';
import { queryClient } from '@/queryClient';
import { MATCH_SORTS, type MatchesQuery, type MatchSort } from '@/types/match';
import Header from '@/components/header/Header';
import Home from '@/pages/Home';
import Leaderboard from '@/pages/Leaderboard';
import LeaderboardIndex from '@/pages/LeaderboardIndex';
import MatchesHistory from '@/pages/MatchesHistory';
import NotFound from '@/pages/NotFound';
import User from '@/pages/User';

const rootRoute = createRootRouteWithContext<{ queryClient: QueryClient }>()({
    component: () => (
        <>
            <Header />
            <div className='site-main'>
                <Outlet />
            </div>
            <footer className='site-footer'>
                Data from the Ninja Kiwi Open Data API. Not affiliated with Ninja Kiwi.
            </footer>
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
    // the URL holds a string, the app works with the numeric season id
    params: {
        parse: ({ season }) => ({ season: Number(season) }),
        stringify: ({ season }) => ({ season: String(season) }),
    },
    // starts on hover (preload) and on navigation, without blocking the page
    loader: ({ context, params }) => {
        void context.queryClient.prefetchQuery(leaderboardQueryOptions(params.season));
    },
    component: Leaderboard,
});

const matchesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/matches-history',
    // filters live in the URL: shareable links, and Back undoes a filter
    validateSearch: (search: Record<string, unknown>): MatchesQuery => {
        const text = (value: unknown, max = 40) =>
            typeof value === 'string' && value.trim() !== ''
                ? value.trim().slice(0, max)
                : undefined;
        const season = Number(search.season);
        return {
            season: season,
            player: text(search.player) || '',
            heroes: text(search.heroes, 120) || '',
            towers: text(search.towers, 200) || '',
            map: text(search.map) || '',
            sort: MATCH_SORTS.includes(search.sort as MatchSort)
                ? (search.sort as MatchSort)
                : 'newest',
            sameSide: search.sameSide === true || search.sameSide === 'true' ? true : false,
        };
    },
    component: MatchesHistory,
});

const userRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/user/$userId',
    loader: ({ context, params, preload }) => {
        void context.queryClient.prefetchQuery(profileQueryOptions(params.userId));
        // the rest only once the visitor actually opens the profile, not on every hover
        if (!preload)
            void context.queryClient.prefetchQuery(seasonStatsQueryOptions(params.userId));
    },
    component: User,
});

const routeTree = rootRoute.addChildren([
    homeRoute,
    leaderboardIndexRoute,
    leaderboardRoute,
    matchesRoute,
    userRoute,
]);

export const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // hovering or focusing a link for 150 ms runs its loader, which prefetches the data
    defaultPreload: 'intent',
    defaultPreloadDelay: 150,
    // React Query owns caching; let loaders run every time
    defaultPreloadStaleTime: 0,
});

// typed <Link to> / useParams across the app
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
