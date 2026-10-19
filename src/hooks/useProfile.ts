import { toError } from '@/services/api/utils';
import { userService } from '@/services/api/user';
import type { UserProfileData } from '@/types/profile';
import { queryOptions, useQuery } from '@tanstack/react-query';

/** The profile our server stored (/users/:id); the server reads Ninja Kiwi in the background. */
export const profileQueryOptions = (userId: string) =>
    queryOptions<UserProfileData>({
        queryKey: ['userProfile', userId],
        queryFn: async () => {
            const response = await userService.getProfile(userId);
            if (!response.success || !response.data?.body) {
                throw toError(response, 'Could not load this profile');
            }
            return response.data;
        },
        staleTime: 60_000,
        retry: (count, error) => count < 2 && !/not found|invalid|no profile/i.test(error.message),
    });

export default function useProfile(userId: string) {
    return useQuery({ ...profileQueryOptions(userId), enabled: !!userId });
}
