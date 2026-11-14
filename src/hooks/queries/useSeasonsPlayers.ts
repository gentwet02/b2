import { useMemo } from 'react';
import { useQueries, type UseQueryResult } from '@tanstack/react-query';
import { leaderboardQueryOptions } from '@/hooks/queries/useLeaderboard';
import useSeasons from '@/hooks/queries/useSeasons';
import type { LeaderboardResponse, SeasonsPlayer } from '@/types/leaderboard';
import type { SeasonQuery } from '@/types/season';
import { decodeLeaderboardPlayer } from '@/utils/decode';
import { seasonIdsOf } from '@/utils/season';

// a module-level combine keeps its result stable between renders
function combineBoards(results: UseQueryResult<LeaderboardResponse>[]) {
    return {
        boards: results.map((r) => r.data),
        isLoading: results.some((r) => r.isLoading),
        error: results.find((r) => r.error)?.error ?? null,
    };
}

/**
 * Everyone on the leaderboards of the seasons a query counts (a range, "all"), for the player
 * pickers: the newest leaderboard in its order, then whoever only ranked in older ones, each
 * once, at the newest season they ranked in. The leaderboards share useLeaderboard's cache.
 */
export default function useSeasonsPlayers(query: SeasonQuery | undefined, enabled = true) {
    const seasons = useSeasons();
    const info = seasons.data;
    const ids = useMemo(() => (enabled ? seasonIdsOf(query, info) : []), [enabled, query, info]);
    const { boards, isLoading, error } = useQueries({
        queries: ids.map((id) => leaderboardQueryOptions(id, id === info?.liveSeason)),
        combine: combineBoards,
    });

    const players = useMemo<SeasonsPlayer[]>(() => {
        const seen = new Set<string>();
        const list: SeasonsPlayer[] = [];
        boards.forEach((board, i) => {
            (board?.data ?? []).forEach((encoded, rank) => {
                if (seen.has(encoded.i)) return;
                seen.add(encoded.i);
                list.push({
                    ...decodeLeaderboardPlayer(encoded),
                    rank: rank + 1,
                    ...(i > 0 && { seasonId: ids[i] }),
                });
            });
        });
        return list;
    }, [boards, ids]);

    return { players, isLoading: isLoading || (enabled && seasons.isLoading), error };
}
