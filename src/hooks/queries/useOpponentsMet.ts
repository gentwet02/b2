import { useQuery } from '@tanstack/react-query';
import { AGGREGATE_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { compareService } from '@/services/api/compare';
import type { SeasonScope } from '@/types/season';

/** Everyone the player met in a season (or all), most games first. */
export default function useOpponentsMet(userId: string, season?: SeasonScope) {
    return useQuery({
        queryKey: queryKeys.opponentsMet(userId, season ?? 'live'),
        queryFn: async () =>
            (
                await fetchData(
                    compareService.getOpponents(userId, season),
                    'Could not list the opponents',
                )
            ).opponents,
        enabled: !!userId,
        staleTime: AGGREGATE_QUERY.stale,
        gcTime: AGGREGATE_QUERY.gc,
    });
}
