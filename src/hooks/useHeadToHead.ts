import { compareService } from '@/services/api/compare';
import { toError } from '@/services/api/utils';
import type { CompareSeason, HeadToHead } from '@/types/compare';
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

export const headToHeadQueryOptions = (
    userId: string,
    opponents: string[],
    season?: CompareSeason,
) =>
    queryOptions<HeadToHead>({
        // slot order doesn't change the answer: one cache entry per set of opponents
        queryKey: [
            'headToHead',
            userId,
            season ?? 'live',
            opponents.length ? [...opponents].sort().join(',') : 'top',
        ],
        queryFn: async () => {
            const response = await compareService.getHeadToHead(userId, opponents, season);
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load the head to head');
            }
            return response.data;
        },
        // the server caches 5 minutes too; a set of opponents seen once comes back instantly
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
    });

/** The profile player's games against each opponent. */
export default function useHeadToHead(
    userId: string,
    opponents: string[],
    season?: CompareSeason,
    enabled = true,
) {
    return useQuery({
        ...headToHeadQueryOptions(userId, opponents, season),
        enabled: !!userId && enabled,
        // swapping one opponent keeps the nine others on screen while it loads
        placeholderData: keepPreviousData,
    });
}
