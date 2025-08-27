import type { MatchesResponse, MatchesStatusResponse, MatchesUpdateResponse } from '@/types/match';
import { getFromApi } from '@/services/api/utils';

export const matchesService = {
    getMatchesRecentHistory: () => getFromApi<MatchesResponse>('matches-history'),
    getMatchesRecentHistoryStatus: () => getFromApi<MatchesStatusResponse>('matchesHistory/status'),
    matchesRecentHistoryForceUpdate: () =>
        getFromApi<MatchesUpdateResponse>('matchesHistory/force-update'),
};
