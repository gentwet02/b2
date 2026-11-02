import { createRoute } from '@tanstack/react-router';
import Stats from '@/pages/stats/Stats';
import { onlyParsed } from '@/utils/search';
import { parseStatsSearch } from '@/utils/statsSearch';
import { rootRoute } from './rootRoute';

export const statsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/stats',
    validateSearch: parseStatsSearch,
    // links and navigations to the page go through the same rules as the URL it opens
    search: { middlewares: [onlyParsed(parseStatsSearch)] },
    component: Stats,
});
