import { getFromApi } from '@/services/api/utils';
import type { UserMatchesResponse } from '@/types/match';
import type { UserProfileData } from '@/types/profile';

export const userService = {
    getProfile: (userId: string) => getFromApi<UserProfileData>(`users/${userId}`),
    getRecentMatches: (userId: string) =>
        getFromApi<UserMatchesResponse>(`users/${userId}/matches`),
};
