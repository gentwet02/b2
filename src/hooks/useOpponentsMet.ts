import { compareService } from '@/services/api/compare';
import { toError } from '@/services/api/utils';
import type { CompareSeason, MetOpponent } from '@/types/compare';
import { useQuery } from '@tanstack/react-query';

/** Everyone the player met in a season (or all), most games first. */
export default function useOpponentsMet(userId: string, season?: CompareSeason) {
    return useQuery<MetOpponent[]>({
        queryKey: ['opponentsMet', userId, season ?? 'live'],
        queryFn: async () => {
            const response = await compareService.getOpponents(userId, season);
            if (!response.success || !response.data) {
                throw toError(response, 'Could not list the opponents');
            }
            return response.data.opponents;
        },
        enabled: !!userId,
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
    });
}
