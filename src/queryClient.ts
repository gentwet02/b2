import { QueryClient } from '@tanstack/react-query';

/** Shared by React (App.tsx) and the router, whose loaders prefetch data on hover. */
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
        },
    },
});
