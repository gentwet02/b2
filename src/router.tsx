import { createRouter, createRootRoute, createRoute, Outlet } from '@tanstack/react-router';
import Home from '@/pages/Home';

const rootRoute = createRootRoute({
    component: () => <Outlet />,
});

const routes = [
    createRoute({
        getParentRoute: () => rootRoute,
        path: '/',
        component: Home,
    }),
];

const routeTree = rootRoute.addChildren(routes);
export const router = createRouter({ routeTree });
