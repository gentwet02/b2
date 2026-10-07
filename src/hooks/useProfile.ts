import { userService } from '@/services/api/user';
import { toError } from '@/services/api/utils';
import type { UserProfileData } from '@/types/profile';
import { useQuery } from '@tanstack/react-query';

/**
 * Goes through our server (/users/:id): Ninja Kiwi's API sends no CORS headers,
 * so calling it from the browser fails with "NetworkError when attempting to fetch resource".
 */
export default function useProfile(userId: string) {
    return useQuery<UserProfileData>({
        queryKey: ['userProfile', userId],
        queryFn: async () => {
            const response = await userService.getProfile(userId);
            if (!response.success || !response.data?.body) {
                throw toError(response, 'Could not load this profile');
            }
            return response.data;
        },
        enabled: !!userId,
        staleTime: 60_000,
        retry: (count, error) => count < 2 && !/not found|invalid/i.test(error.message),
    });
}
