import { leaderboardService } from '@/services/api/leaderboard';
import type { ApiResponse } from '@/types/api';
import type { LeaderboardResponse } from '@/types/leaderboard';
import { useQuery } from '@tanstack/react-query';

export default function useLeaderboard(seasonId: number) {
    return useQuery<ApiResponse<LeaderboardResponse>>({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const response = await leaderboardService.getLeaderboard(seasonId);
            if (!response.success)
                throw new Error(`Failed to fetch leaderboard for season ${seasonId}`);
            console.log(`fetch leaderboard for season ${seasonId}`);
            return response;
        },
    });
}
