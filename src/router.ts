import { createRouter } from '@tanstack/react-router';
import { queryClient } from '@/queryClient';
import { routeTree } from '@/routes/routeTree';

export const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // hovering a link loads its page's data
    defaultPreload: 'intent',
    defaultPreloadDelay: 150,
    defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
