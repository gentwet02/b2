import { createRoute } from '@tanstack/react-router';
import Home from '@/pages/Home';
import { rootRoute } from './rootRoute';

export const homeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: Home,
});
