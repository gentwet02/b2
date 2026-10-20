import { toError } from '@/services/api/utils';
import { userService } from '@/services/api/user';
import type { PlayerSeasonRecord } from '@/types/profile';
import { useQuery } from '@tanstack/react-query';

/** A player's W/D/L in every season, from the matches our server recorded, newest first. */
export default function useSeasonRecords(userId: string) {
    return useQuery<PlayerSeasonRecord[]>({
        queryKey: ['seasonRecords', userId],
        queryFn: async () => {
            const response = await userService.getSeasonRecords(userId);
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load the season records');
            }
            return response.data.seasons;
        },
        enabled: !!userId,
        staleTime: 60_000,
    });
}
