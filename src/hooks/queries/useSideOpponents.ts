import { useQuery } from '@tanstack/react-query';
import { AGGREGATE_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { compareService, type MetSideParams } from '@/services/api/compare';
import type { SeasonQuery } from '@/types/season';

/**
 * Everyone a player or a clan met in a season (or all): the players and their clans, most
 * games first. `side` null: nothing asked.
 */
export default function useSideOpponents(side: MetSideParams | null, season?: SeasonQuery) {
    const id = side ? ('player' in side ? side.player : side.clan) : '';
    return useQuery({
        queryKey: queryKeys.opponentsMet(id, season ?? 'live'),
        queryFn: () =>
            fetchData(
                compareService.getSideOpponents(side!, season),
                'Could not list the opponents',
            ),
        enabled: !!side,
        staleTime: AGGREGATE_QUERY.stale,
        gcTime: AGGREGATE_QUERY.gc,
    });
}
