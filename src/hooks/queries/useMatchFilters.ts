import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { MATCHES_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { matchesService, withoutSort } from '@/services/api/matchesHistory';
import type { MatchesQuery } from '@/types/match';

/** Heroes, towers and maps available within the other selected filters, with counts. */
export default function useMatchFilters(query: MatchesQuery) {
    const filters = withoutSort(query);
    return useQuery({
        queryKey: queryKeys.matchFilters(filters),
        queryFn: () =>
            fetchData(
                matchesService.getFilterOptions(filters),
                'Could not load the filter options',
            ),
        staleTime: MATCHES_QUERY.filtersStale,
        placeholderData: keepPreviousData,
    });
}
