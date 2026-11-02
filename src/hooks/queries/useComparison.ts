import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';
import { AGGREGATE_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import {
    compareService,
    normalizeCompareParams,
    type CompareParams,
} from '@/services/api/compare';

export function comparisonQueryOptions(params: CompareParams) {
    const normalized = normalizeCompareParams(params);
    return queryOptions({
        queryKey: queryKeys.compare(normalized),
        queryFn: () =>
            fetchData(compareService.getComparison(normalized), 'Could not load the comparison'),
        staleTime: AGGREGATE_QUERY.stale,
        gcTime: AGGREGATE_QUERY.gc,
    });
}

/** Only the games between two sides (a player or a top N each), from side 1's view. */
export default function useComparison(params: CompareParams, enabled = true) {
    return useQuery({
        ...comparisonQueryOptions(params),
        enabled,
        placeholderData: keepPreviousData,
    });
}
