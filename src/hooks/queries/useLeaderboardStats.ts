import { useQuery } from '@tanstack/react-query';
import { LEADERBOARD_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { leaderboardService } from '@/services/api/leaderboard';

/** Recorded games per player and known avatars for a season's leaderboard. */
export default function useLeaderboardStats(seasonId: number | undefined) {
    return useQuery({
        queryKey: queryKeys.leaderboardStats(seasonId),
        queryFn: () =>
            fetchData(
                leaderboardService.getStats(seasonId!),
                'Could not load the leaderboard stats',
            ),
        enabled: typeof seasonId === 'number' && seasonId >= 0,
        staleTime: LEADERBOARD_QUERY.statsStale,
    });
}
