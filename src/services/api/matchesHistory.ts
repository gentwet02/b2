import { MATCHES_PAGE_SIZE } from '@/config/match';
import { getFromApi, withQuery } from '@/services/api/client';
import type { MatchFilterOptions, MatchesQuery, MatchesResponse } from '@/types/match';

/** The filters alone: the sort doesn't change which matches fit. */
export function withoutSort(query: MatchesQuery): Omit<MatchesQuery, 'sort'> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { sort: _sort, ...filters } = query;
    return filters;
}

export const matchesService = {
    getMatchesRecentHistory: (query: MatchesQuery, offset = 0, limit = MATCHES_PAGE_SIZE) =>
        getFromApi<MatchesResponse>(withQuery('matches-history', { ...query, offset, limit })),
    getFilterOptions: (query: MatchesQuery) =>
        getFromApi<MatchFilterOptions>(withQuery('matches-history/filters', withoutSort(query))),
};
