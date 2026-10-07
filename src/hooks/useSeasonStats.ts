import { toError } from '@/services/api/utils';
import { userService } from '@/services/api/user';
import type { SeasonStats } from '@/types/profile';
import { queryOptions, useQuery } from '@tanstack/react-query';

export const seasonStatsQueryOptions = (userId: string, season?: number) =>
    queryOptions<SeasonStats>({
        queryKey: ['seasonStats', userId, season ?? 'live'],
        queryFn: async () => {
            const response = await userService.getSeasonStats(userId, season);
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load the season record');
            }
            return response.data;
        },
        staleTime: 60_000,
    });

/** A player's ranked record this season, from the matches our server recorded. */
export default function useSeasonStats(userId: string, season?: number) {
    return useQuery({ ...seasonStatsQueryOptions(userId, season), enabled: !!userId });
}
