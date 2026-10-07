import { leaderboardService } from '@/services/api/leaderboard';
import { toError } from '@/services/api/utils';
import type { LeaderboardResponse } from '@/types/leaderboard';
import { useQuery } from '@tanstack/react-query';

export const leaderboardKey = (seasonId: number) => ['leaderboard', seasonId] as const;

export default function useLeaderboard(seasonId: number | undefined, live = false) {
    return useQuery<LeaderboardResponse>({
        queryKey: leaderboardKey(seasonId ?? -1),
        queryFn: async () => {
            const response = await leaderboardService.getLeaderboard(seasonId!);
            if (!response.success || !response.data) {
                throw toError(response, `Could not load the season ${seasonId! + 1} leaderboard`);
            }
            return response.data;
        },
        enabled: typeof seasonId === 'number' && Number.isFinite(seasonId),
        staleTime: live ? 30_000 : 10 * 60 * 1000,
        // the server refreshes the live season on a schedule, follow it
        refetchInterval: live ? 60_000 : false,
    });
}
