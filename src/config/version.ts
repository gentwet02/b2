/** Written at the site root by the build (vite.config.ts), next to index.html. */
export const VERSION_URL = '/version.json';

/** How often an open, visible tab asks whether a new build was deployed. */
export const VERSION_CHECK_MS = 5 * 60 * 1000;

/**
 * sessionStorage key: the build id we last reloaded for. If the reload still served the old
 * build (a cached index.html), this stops it from reloading again on every page.
 */
export const RELOADED_FOR_KEY = 'b2.version.reloadedFor';
