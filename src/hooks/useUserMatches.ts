import { toError } from '@/services/api/utils';
import { userService } from '@/services/api/user';
import type { Match } from '@/types/match';
import { useQuery } from '@tanstack/react-query';

export default function useUserMatches(userId: string) {
    return useQuery<Match[]>({
        queryKey: ['userMatches', userId],
        queryFn: async () => {
            const response = await userService.getRecentMatches(userId);
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load recent matches');
            }
            return response.data.body ?? [];
        },
        enabled: !!userId,
        staleTime: 60_000,
        retry: 1,
    });
}
