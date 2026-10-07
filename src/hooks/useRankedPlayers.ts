import { useMemo } from 'react';
import useLeaderboard from '@/hooks/useLeaderboard';
import type { RankedPlayer } from '@/features/LeaderboardScore';
import { decodeLeaderboardPlayer } from '@/utils/decode';

/** Decoded, ranked players of a season. Shares its cache with every other caller. */
export function useRankedPlayers(season: number | undefined, live = false) {
    const query = useLeaderboard(season, live);
    const players = useMemo<RankedPlayer[]>(
        () =>
            (query.data?.data ?? []).map((encoded, i) => ({
                ...decodeLeaderboardPlayer(encoded),
                rank: i + 1,
            })),
        [query.data],
    );
    return { ...query, players };
}
