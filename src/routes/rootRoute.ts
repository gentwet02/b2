import type { QueryClient } from '@tanstack/react-query';
import { createRootRouteWithContext } from '@tanstack/react-router';
import RootLayout from '@/components/layout/RootLayout';
import NotFound from '@/pages/NotFound';

/** The loaders get the query client to prefetch a page's data (on hover, see router.ts). */
export interface RouterContext {
    queryClient: QueryClient;
}

export const rootRoute = createRootRouteWithContext<RouterContext>()({
    component: RootLayout,
    notFoundComponent: NotFound,
});
