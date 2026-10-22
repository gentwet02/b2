import { useQuery } from '@tanstack/react-query';
import { PLAYER_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { userService } from '@/services/api/user';

/** A player's W/D/L in every season, from the matches our server recorded, newest first. */
export default function useSeasonRecords(userId: string) {
    return useQuery({
        queryKey: queryKeys.seasonRecords(userId),
        queryFn: async () =>
            (
                await fetchData(
                    userService.getSeasonRecords(userId),
                    'Could not load the season records',
                )
            ).seasons,
        enabled: !!userId,
        staleTime: PLAYER_QUERY.stale,
    });
}
