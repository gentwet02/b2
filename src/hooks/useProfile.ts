import { toError } from '@/services/api/utils';
import { userService } from '@/services/api/user';
import type { UserProfileData } from '@/types/profile';
import { queryOptions, useQuery } from '@tanstack/react-query';

/** Goes through our server (/users/:id): Ninja Kiwi's API sends no CORS headers. */
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
        retry: (count, error) => count < 2 && !/not found|invalid/i.test(error.message),
        // the server answered with its stored copy and is fetching a fresh one: pick it up
        refetchInterval: (query) => {
            const fetchedAt = query.state.data?.fetchedAt;
            const old = fetchedAt && Date.now() - new Date(fetchedAt).getTime() > 2 * 60_000;
            return old && query.state.dataUpdateCount < 3 ? 4_000 : false;
        },
    });

export default function useProfile(userId: string) {
    return useQuery({ ...profileQueryOptions(userId), enabled: !!userId });
}
