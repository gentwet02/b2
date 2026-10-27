import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { AGGREGATE_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { compareService, type CompareParams, type CompareSideParams } from '@/services/api/compare';

const sideKey = (side: CompareSideParams) =>
    'player' in side
        ? `p:${side.player}`
        : 'anyone' in side
          ? 'anyone'
          : `${side.range}${side.exclude ? `-${side.exclude}` : ''}`;

export const comparisonQueryOptions = (params: CompareParams) =>
    queryOptions({
        queryKey: queryKeys.compare(
            params.season ?? 'live',
            sideKey(params.a),
            sideKey(params.b),
            params.overlap === false ? 'apart' : 'both',
            JSON.stringify(params.filters ?? {}),
        ),
        queryFn: () =>
            fetchData(compareService.getComparison(params), 'Could not load the comparison'),
        staleTime: AGGREGATE_QUERY.stale,
        gcTime: AGGREGATE_QUERY.gc,
    });

/** Only the games between two sides (a player or a top N each), from side 1's view. */
export default function useComparison(params: CompareParams, enabled = true) {
    return useQuery({
        ...comparisonQueryOptions(params),
        enabled,
        placeholderData: keepPreviousData,
    });
}
