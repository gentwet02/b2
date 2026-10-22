import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { AGGREGATE_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { compareService, type VersusParams } from '@/services/api/compare';

export const versusQueryOptions = (userId: string, params: VersusParams) =>
    queryOptions({
        queryKey: queryKeys.versus(
            userId,
            params.season ?? 'live',
            params.vs ? `vs:${params.vs}` : `range:${params.range}${params.exclude ? `-${params.exclude}` : ''}`,
        ),
        queryFn: () =>
            fetchData(compareService.getVersus(userId, params), 'Could not load the head to head'),
        staleTime: AGGREGATE_QUERY.stale,
        gcTime: AGGREGATE_QUERY.gc,
    });

/** The player against one opponent or a top N, only the games between them. */
export default function useVersus(userId: string, params: VersusParams, enabled = true) {
    return useQuery({
        ...versusQueryOptions(userId, params),
        enabled: !!userId && enabled,
        placeholderData: keepPreviousData,
    });
}
