import { queryOptions, useQuery } from '@tanstack/react-query';
import { PLAYER_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { userService } from '@/services/api/user';

export const userMatchesQueryOptions = (userId: string) =>
    queryOptions({
        queryKey: queryKeys.userMatches(userId),
        queryFn: async () =>
            (await fetchData(userService.getRecentMatches(userId), 'Could not load recent matches'))
                .body ?? [],
        staleTime: PLAYER_QUERY.stale,
        // the server rate limits this one (NK request): don't retry when it says so
        retry: (count, error) => count < 1 && !/too many/i.test(error.message),
    });

export default function useUserMatches(userId: string, enabled = true) {
    return useQuery({ ...userMatchesQueryOptions(userId), enabled: enabled && !!userId });
}
