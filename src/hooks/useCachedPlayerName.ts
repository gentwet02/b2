import { queryKeys } from '@/hooks/queries/keys';
import useCachedQueriesData from '@/hooks/useCachedQueriesData';
import type { LeaderboardResponse } from '@/types/leaderboard';

/** A player's name from any leaderboard already loaded, to show while their profile loads. */
export default function useCachedPlayerName(userId: string) {
    const boards = useCachedQueriesData<LeaderboardResponse>(queryKeys.leaderboard());
    for (const [, data] of boards) {
        const player = data?.data?.find((p) => p.i === userId);
        if (player) return player.r || player.n;
    }
    return undefined;
}
