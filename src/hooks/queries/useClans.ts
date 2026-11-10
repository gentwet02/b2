import { useQuery } from '@tanstack/react-query';
import { CLAN_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { clanService } from '@/services/api/clans';

/** Every clan with a player the server knows, the most known players first. */
export default function useClans(enabled = true) {
    return useQuery({
        queryKey: queryKeys.clans(),
        queryFn: async () =>
            (await fetchData(clanService.getClans(), 'Could not list the clans')).clans,
        enabled,
        staleTime: CLAN_QUERY.listStale,
    });
}
