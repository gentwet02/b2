/** NK user ids: what the URL accepts for a player. */
export const USER_ID_PATTERN = /^[a-z0-9]{48}$/i;

/** Tags are searched by their start, from this many characters (btdb2server `config/tags.ts`). */
export const TAG_SEARCH_MIN_LENGTH = 3;

/** The server's player tag lists (btdb2server `config/tags.ts`), as shown. */
export const PLAYER_TAG_LABELS = {
    cheater: 'Cheater',
    nuker: 'Nuker',
    booster: 'Booster',
    suspicious: 'Suspicious',
} as const;
