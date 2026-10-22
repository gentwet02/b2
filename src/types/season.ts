/** One season id, or every season together. */
export type SeasonScope = number | 'all';

/** Who a page is about: one player, or a range of the leaderboard. */
export type GroupMode = 'player' | 'top';

export interface SeasonSummary {
    id: number;
    name: string;
    live: boolean;
}
