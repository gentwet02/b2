import { userCompareRoute } from './compareRoute';
import { homeRoute } from './homeRoute';
import { leaderboardIndexRoute } from './leaderboardIndexRoute';
import { leaderboardRoute } from './leaderboardRoute';
import { matchesRoute } from './matchesRoute';
import { rootRoute } from './rootRoute';
import { statsRoute } from './statsRoute';
import { userRoute } from './userRoute';

export const routeTree = rootRoute.addChildren([
    homeRoute,
    leaderboardIndexRoute,
    leaderboardRoute,
    matchesRoute,
    userRoute,
    userCompareRoute,
    statsRoute,
]);
