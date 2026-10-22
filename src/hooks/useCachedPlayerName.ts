import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/queries/keys';
import type { LeaderboardResponse } from '@/types/leaderboard';

/** A player's name from any leaderboard already loaded, to show while their profile loads. */
export default function useCachedPlayerName(userId: string) {
    const queryClient = useQueryClient();
    for (const [, data] of queryClient.getQueriesData<LeaderboardResponse>({
        queryKey: queryKeys.leaderboard(),
    })) {
        const player = data?.data?.find((p) => p.i === userId);
        if (player) return player.r || player.n;
    }
    return undefined;
}
