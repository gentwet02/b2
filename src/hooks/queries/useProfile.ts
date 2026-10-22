import { queryOptions, useQuery } from '@tanstack/react-query';
import { PLAYER_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { toError } from '@/services/api/client';
import { userService } from '@/services/api/user';

/** The profile our server stored (/users/:id); the server reads Ninja Kiwi in the background. */
export const profileQueryOptions = (userId: string) =>
    queryOptions({
        queryKey: queryKeys.profile(userId),
        queryFn: async () => {
            const response = await userService.getProfile(userId);
            if (!response.success || !response.data?.body) {
                throw toError(response, 'Could not load this profile');
            }
            return response.data;
        },
        staleTime: PLAYER_QUERY.stale,
        retry: (count, error) => count < 2 && !/not found|invalid|no profile/i.test(error.message),
    });

export default function useProfile(userId: string) {
    return useQuery({ ...profileQueryOptions(userId), enabled: !!userId });
}
