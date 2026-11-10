import { useQuery } from '@tanstack/react-query';
import { AGGREGATE_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { clanService } from '@/services/api/clans';

/**
 * A clan's members' games added up: this season and all time, season by season, against the
 * top clans, and each member's record. Heavy for the server, which caches too.
 */
export default function useClanOverview(clanId: string, enabled = true) {
    return useQuery({
        queryKey: queryKeys.clanOverview(clanId),
        queryFn: () =>
            fetchData(clanService.getOverview(clanId), "Could not load the clan's stats"),
        enabled: !!clanId && enabled,
        staleTime: AGGREGATE_QUERY.stale,
        gcTime: AGGREGATE_QUERY.gc,
    });
}
