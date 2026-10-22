import { getFromApi, withQuery } from '@/services/api/client';
import type { UserMatchesResponse } from '@/types/match';
import type {
    PlayerSeasonRecords,
    RankHistory,
    SeasonStats,
    UserProfileData,
} from '@/types/profile';

export const userService = {
    getProfile: (userId: string) => getFromApi<UserProfileData>(`users/${userId}`),
    getRecentMatches: (userId: string) =>
        getFromApi<UserMatchesResponse>(`users/${userId}/matches`),
    getRanks: (userId: string) => getFromApi<RankHistory>(`users/${userId}/ranks`),
    getSeasonStats: (userId: string, season?: number) =>
        getFromApi<SeasonStats>(withQuery(`users/${userId}/season`, { season })),
    getSeasonRecords: (userId: string) =>
        getFromApi<PlayerSeasonRecords>(`users/${userId}/seasons`),
};
