import type { BaseApiResponse } from '@/types/api';
import type { SeasonSummary } from '@/types/season';

/** GET /info */
export interface InfoResponse extends BaseApiResponse {
    liveSeason: number;
    liveSeasonName?: string;
    totalScores: number;
    seasons?: SeasonSummary[];
    lastFetch?: string | null;
}
