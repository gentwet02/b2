import { createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import Header from '@/components/header/Header';
import Home from '@/pages/Home';
import Leaderboard from '@/pages/Leaderboard';
import LeaderboardIndex from '@/pages/LeaderboardIndex';
import MatchesHistory from '@/pages/MatchesHistory';
import NotFound from '@/pages/NotFound';
import User from '@/pages/User';

const rootRoute = createRootRoute({
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
    params: {
        parse: ({ season }) => ({ season: Number(season) }),
        stringify: ({ season }) => ({ season: String(season) }),
    },
    component: Leaderboard,
});

const matchesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/matches-history',
    component: MatchesHistory,
});

const userRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/user/$userId',
    component: User,
});

const routeTree = rootRoute.addChildren([
    homeRoute,
    leaderboardIndexRoute,
    leaderboardRoute,
    matchesRoute,
    userRoute,
]);

export const router = createRouter({ routeTree, scrollRestoration: true });

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
