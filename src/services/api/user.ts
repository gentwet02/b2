import { getFromApi } from '@/services/api/utils';
import type { UserMatchesResponse } from '@/types/match';
import type { RankHistory, SeasonStats, UserProfileData } from '@/types/profile';

export const userService = {
    getProfile: (userId: string) => getFromApi<UserProfileData>(`users/${userId}`),
    getRecentMatches: (userId: string) =>
        getFromApi<UserMatchesResponse>(`users/${userId}/matches`),
    getRanks: (userId: string) => getFromApi<RankHistory>(`users/${userId}/ranks`),
    getSeasonStats: (userId: string, season?: number) =>
        getFromApi<SeasonStats>(
            `users/${userId}/season${season !== undefined ? `?season=${season}` : ''}`,
        ),
};
