import type { LeaderboardResponse } from '@/types/leaderboard';
import { getFromApi } from '@/services/api/utils';

export const leaderboardService = {
    getLeaderboard: (seasonId: number) =>
        getFromApi<LeaderboardResponse>(`leaderboard/${seasonId}`),
};
