import { matchesService } from '@/services/api/matchesHistory';
import { toError } from '@/services/api/utils';
import type { MatchFilterOptions, MatchesQuery } from '@/types/match';
import { keepPreviousData, useQuery } from '@tanstack/react-query';

/** Heroes, towers and maps available within the other selected filters, with counts. */
export default function useMatchFilters(query: MatchesQuery) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sort: _sort, ...filters } = query;
    return useQuery<MatchFilterOptions>({
        queryKey: ['matchFilters', filters],
        queryFn: async () => {
            const response = await matchesService.getFilterOptions(filters);
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load the filter options');
            }
            return response.data;
        },
        staleTime: 60_000,
        placeholderData: keepPreviousData,
    });
}
