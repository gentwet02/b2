import { QueryClient } from '@tanstack/react-query';
import { QUERY_DEFAULTS } from '@/config/queries';

/** Shared by React (App.tsx) and the router, whose loaders prefetch data on hover. */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: QUERY_DEFAULTS.stale,
            refetchOnWindowFocus: false,
            retry: QUERY_DEFAULTS.retry,
        },
    },
});
