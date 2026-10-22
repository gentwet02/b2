import { getFromApi } from '@/services/api/client';
import type { LeaderboardResponse, LeaderboardStats } from '@/types/leaderboard';

export const leaderboardService = {
    getLeaderboard: (seasonId: number) =>
        getFromApi<LeaderboardResponse>(`leaderboard/${seasonId}`),
    getStats: (seasonId: number) => getFromApi<LeaderboardStats>(`leaderboard/${seasonId}/stats`),
};
