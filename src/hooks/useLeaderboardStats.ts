import { leaderboardService } from '@/services/api/leaderboard';
import { toError } from '@/services/api/utils';
import type { LeaderboardStats } from '@/types/leaderboard';
import { useQuery } from '@tanstack/react-query';

/** Recorded games per player and known avatars for a season's leaderboard. */
export default function useLeaderboardStats(seasonId: number | undefined) {
    return useQuery<LeaderboardStats>({
        queryKey: ['leaderboardStats', seasonId],
        queryFn: async () => {
            const response = await leaderboardService.getStats(seasonId!);
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load the leaderboard stats');
            }
            return response.data;
        },
        enabled: typeof seasonId === 'number' && seasonId >= 0,
        staleTime: 2 * 60_000,
    });
}
