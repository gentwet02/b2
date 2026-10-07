import type { LeaderboardResponse, LeaderboardStats } from '@/types/leaderboard';
import { getFromApi } from '@/services/api/utils';

export const leaderboardService = {
    getLeaderboard: (seasonId: number) =>
        getFromApi<LeaderboardResponse>(`leaderboard/${seasonId}`),
    getStats: (seasonId: number) => getFromApi<LeaderboardStats>(`leaderboard/${seasonId}/stats`),
};
