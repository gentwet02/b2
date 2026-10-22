/**
 * Set VITE_API_URL in .env to point at another server.
 * Defaults: localhost:3000 in dev, same origin in production.
 */
export const API_URL =
    import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '');

/** Avatar requests made within this window go out as one batch. */
export const AVATAR_BATCH_MS = 40;
/** Ids per avatar request (the server's limit). */
export const AVATAR_BATCH_MAX = 100;

/** Ninja Kiwi's profile URLs, which carry the user id: `${prefix}${id}/…` */
export const NK_PROFILE_PREFIX = 'https://data.ninjakiwi.com/battles2/users/';
