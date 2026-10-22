import { useQuery } from '@tanstack/react-query';
import { INFO_QUERY } from '@/config/queries';
import { queryKeys } from '@/hooks/queries/keys';
import { fetchData } from '@/services/api/client';
import { infoService } from '@/services/api/info';

/** Server info: live season id plus the list of known seasons. */
export default function useSeasons() {
    return useQuery({
        queryKey: queryKeys.info(),
        queryFn: async () => {
            const info = await fetchData(infoService.getInfo(), 'Could not load the season list');
            // the server answers 200 with no liveSeason while it boots
            if (typeof info.liveSeason !== 'number') {
                throw new Error('The server is still loading seasons. Try again in a moment.');
            }
            return info;
        },
        staleTime: INFO_QUERY.stale,
        retry: INFO_QUERY.retry,
        retryDelay: INFO_QUERY.retryDelay,
    });
}
