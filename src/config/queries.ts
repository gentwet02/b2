/**
 * How long fetched data stays fresh (`stale`), stays cached unused (`gc`), and how often it's
 * polled. One place to trade freshness against server load.
 */
const SECOND = 1000;
const MINUTE = 60 * SECOND;

/** Every query, unless it says otherwise. */
export const QUERY_DEFAULTS = {
    stale: 5 * SECOND,
    retry: 1,
};

/** Season list (/info): retried a few times while the server boots. */
export const INFO_QUERY = {
    stale: 5 * MINUTE,
    retry: 3,
    retryDelay: (attempt: number) => Math.min(2 * SECOND * 2 ** attempt, 10 * SECOND),
};

export const LEADERBOARD_QUERY = {
    /** the live season (a finished one never changes: fresh forever) */
    liveStale: 30 * SECOND,
    /** the server refreshes the live season on a schedule, follow it */
    livePoll: MINUTE,
    statsStale: 2 * MINUTE,
};

export const MATCHES_QUERY = {
    stale: 30 * SECOND,
    /** new matches land in the database while the crawler runs */
    pollWhileCrawling: 30 * SECOND,
    poll: 5 * MINUTE,
    filtersStale: MINUTE,
};

/** Profile, season record, season history, NK's latest matches. */
export const PLAYER_QUERY = {
    stale: MINUTE,
    ranksStale: 5 * MINUTE,
};

/** Head to head, versus, opponents met and stats: heavy for the server, which caches 5 minutes too. */
export const AGGREGATE_QUERY = {
    stale: 5 * MINUTE,
    gc: 30 * MINUTE,
};

export const AVATAR_QUERY = {
    stale: 30 * MINUTE,
    gc: 30 * MINUTE,
    /** how often a row asks again while the server is fetching the profile */
    poll: 4 * SECOND,
    /** answers still pending before giving up (showing the initial): about a minute */
    maxPolls: 15,
};
