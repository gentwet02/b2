import { queryOptions, useQuery } from '@tanstack/react-query';
import { CLAN_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { clanService } from '@/services/api/clans';

/** The server knows no such clan (or the id is wrong): asking again won't help. */
export const isMissingClan = (error: Error | null) =>
    !!error && /don't know|invalid/i.test(error.message);

export function clanQueryOptions(clanId: string) {
    return queryOptions({
        queryKey: queryKeys.clan(clanId),
        queryFn: () => fetchData(clanService.getClan(clanId), 'Could not load this clan'),
        staleTime: CLAN_QUERY.stale,
        retry: (count, error) => count < 2 && !isMissingClan(error),
    });
}

/** A clan and its known members. */
export default function useClan(clanId: string) {
    return useQuery({ ...clanQueryOptions(clanId), enabled: !!clanId });
}
