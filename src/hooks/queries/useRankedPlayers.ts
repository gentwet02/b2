import { useMemo } from 'react';
import useLeaderboard from '@/hooks/queries/useLeaderboard';
import type { RankedPlayer } from '@/types/leaderboard';
import { decodeLeaderboardPlayer } from '@/utils/decode';

/** Decoded, ranked players of a season. Shares its cache with every other caller. */
export default function useRankedPlayers(season: number | undefined, live = false) {
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
