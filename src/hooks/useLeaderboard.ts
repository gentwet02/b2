import { leaderboardService } from '@/services/api/leaderboard';
import { toError } from '@/services/api/utils';
import type { LeaderboardResponse } from '@/types/leaderboard';
import { queryOptions, useQuery } from '@tanstack/react-query';

export const leaderboardKey = (seasonId: number) => ['leaderboard', seasonId] as const;

export const leaderboardQueryOptions = (seasonId: number, live = false) =>
    queryOptions<LeaderboardResponse>({
        queryKey: leaderboardKey(seasonId),
        queryFn: async () => {
            const response = await leaderboardService.getLeaderboard(seasonId);
            if (!response.success || !response.data) {
                throw toError(response, `Could not load the season ${seasonId + 1} leaderboard`);
            }
            return response.data;
        },
        // a finished season never changes
        staleTime: live ? 30_000 : Infinity,
        // the server refreshes the live season on a schedule, follow it
        refetchInterval: live ? 60_000 : false,
    });

export default function useLeaderboard(seasonId: number | undefined, live = false) {
    return useQuery({
        ...leaderboardQueryOptions(seasonId ?? -1, live),
        enabled: typeof seasonId === 'number' && Number.isFinite(seasonId) && seasonId >= 0,
    });
}
