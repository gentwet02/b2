import { toError } from '@/services/api/utils';
import { userService } from '@/services/api/user';
import type { RankHistory } from '@/types/profile';
import { useQuery } from '@tanstack/react-query';

/** A player's rank in every season the server stored, and best end-of-season finish. */
export default function useRankHistory(userId: string) {
    return useQuery<RankHistory>({
        queryKey: ['rankHistory', userId],
        queryFn: async () => {
            const response = await userService.getRanks(userId);
            if (!response.success || !response.data)
                throw toError(response, 'Could not load ranks');
            return response.data;
        },
        enabled: !!userId,
        staleTime: 5 * 60_000,
    });
}
