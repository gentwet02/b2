import type {
    MatchFilterOptions,
    MatchesQuery,
    MatchesResponse,
    MatchesUpdateResponse,
} from '@/types/match';
import { getFromApi } from '@/services/api/utils';

export const MATCHES_PAGE_SIZE = 20;

function toParams(query: MatchesQuery) {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(query)) {
        if (value === undefined || value === '' || value === false) continue;
        params.set(key, value === true ? '1' : String(value));
    }
    return params;
}

export const matchesService = {
    getMatchesRecentHistory: (query: MatchesQuery, offset = 0, limit = MATCHES_PAGE_SIZE) => {
        const params = toParams(query);
        params.set('offset', String(offset));
        params.set('limit', String(limit));
        return getFromApi<MatchesResponse>(`matches-history?${params}`);
    },
    getFilterOptions: (query: MatchesQuery) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { sort: _sort, ...filters } = query;
        return getFromApi<MatchFilterOptions>(`matches-history/filters?${toParams(filters)}`);
    },
    matchesRecentHistoryForceUpdate: () =>
        getFromApi<MatchesUpdateResponse>('matches-history/force-update'),
};
