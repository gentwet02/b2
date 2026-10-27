/** One season id, or every season together. */
export type SeasonScope = number | 'all';

/** What the server takes: a season, every season, or a range of them ("40-47"). */
export type SeasonQuery = SeasonScope | `${number}-${number}`;

/** Who a page is about: one player, or a range of the leaderboard. */
export type GroupMode = 'player' | 'top';

export interface SeasonSummary {
    id: number;
    name: string;
    live: boolean;
}
