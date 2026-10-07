import { toError } from '@/services/api/utils';
import { userService } from '@/services/api/user';
import type { Match } from '@/types/match';
import { queryOptions, useQuery } from '@tanstack/react-query';

export const userMatchesQueryOptions = (userId: string) =>
    queryOptions<Match[]>({
        queryKey: ['userMatches', userId],
        queryFn: async () => {
            const response = await userService.getRecentMatches(userId);
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load recent matches');
            }
            return response.data.body ?? [];
        },
        staleTime: 60_000,
        retry: 1,
    });

export default function useUserMatches(userId: string, enabled = true) {
    return useQuery({ ...userMatchesQueryOptions(userId), enabled: enabled && !!userId });
}
