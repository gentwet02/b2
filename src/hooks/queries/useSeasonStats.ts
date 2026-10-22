import { queryOptions, useQuery } from '@tanstack/react-query';
import { PLAYER_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { userService } from '@/services/api/user';

export const seasonStatsQueryOptions = (userId: string, season?: number) =>
    queryOptions({
        queryKey: queryKeys.seasonStats(userId, season ?? 'live'),
        queryFn: () =>
            fetchData(
                userService.getSeasonStats(userId, season),
                'Could not load the season record',
            ),
        staleTime: PLAYER_QUERY.stale,
    });

/** A player's ranked record this season, from the matches our server recorded. */
export default function useSeasonStats(userId: string, season?: number) {
    return useQuery({ ...seasonStatsQueryOptions(userId, season), enabled: !!userId });
}
