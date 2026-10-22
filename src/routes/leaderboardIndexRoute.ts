import { createRoute } from '@tanstack/react-router';
import LeaderboardIndex from '@/pages/LeaderboardIndex';
import { rootRoute } from './rootRoute';

/** /leaderboard: redirects to the live season's. */
export const leaderboardIndexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/leaderboard',
    component: LeaderboardIndex,
});
