import { createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import Home from '@/pages/Home';
import User from '@/pages/User';
import Leaderboard from '@/pages/Leaderboard';
import Header from '@/components/header/Header';
import MatchesHistory from './pages/MatchesHistory';

const rootRoute = createRootRoute({
    component: () => (
        <>
            <Header />
            <Outlet />
        </>
    ),
});

const routes = [
    createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: Home,
    }),
    createRoute({
        getParentRoute: () => rootRoute,
        path: '/leaderboard/$season',
        component: Leaderboard,
    }),
    createRoute({
        getParentRoute: () => rootRoute,
        path: '/matches-history',
        component: MatchesHistory,
    }),
    createRoute({
        getParentRoute: () => rootRoute,
        path: '/user/$userId',
        component: User,
    }),
];

const routeTree = rootRoute.addChildren(routes);
export const router = createRouter({ routeTree });
