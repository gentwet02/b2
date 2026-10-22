import { useQuery } from '@tanstack/react-query';
import { PLAYER_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { userService } from '@/services/api/user';

/** A player's rank in every season the server stored, and best end-of-season finish. */
export default function useRankHistory(userId: string) {
    return useQuery({
        queryKey: queryKeys.rankHistory(userId),
        queryFn: () => fetchData(userService.getRanks(userId), 'Could not load ranks'),
        enabled: !!userId,
        staleTime: PLAYER_QUERY.ranksStale,
    });
}
