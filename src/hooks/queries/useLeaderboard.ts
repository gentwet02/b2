import { queryOptions, useQuery } from '@tanstack/react-query';
import { LEADERBOARD_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { leaderboardService } from '@/services/api/leaderboard';

export const leaderboardQueryOptions = (seasonId: number, live = false) =>
    queryOptions({
        queryKey: queryKeys.leaderboard(seasonId),
        queryFn: () =>
            fetchData(
                leaderboardService.getLeaderboard(seasonId),
                `Could not load the season ${seasonId + 1} leaderboard`,
            ),
        // a finished season never changes
        staleTime: live ? LEADERBOARD_QUERY.liveStale : Infinity,
        refetchInterval: live ? LEADERBOARD_QUERY.livePoll : false,
    });

export default function useLeaderboard(seasonId: number | undefined, live = false) {
    return useQuery({
        ...leaderboardQueryOptions(seasonId ?? -1, live),
        enabled: typeof seasonId === 'number' && Number.isFinite(seasonId) && seasonId >= 0,
    });
}
