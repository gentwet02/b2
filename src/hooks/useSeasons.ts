import { infoService } from '@/services/api/info';
import { toError } from '@/services/api/utils';
import type { infoResponse } from '@/types/info';
import { useQuery } from '@tanstack/react-query';

/** Server info: live season id plus the list of known seasons. */
export default function useSeasons() {
    return useQuery<infoResponse>({
        queryKey: ['info'],
        queryFn: async () => {
            const response = await infoService.getInfo();
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load the season list');
            }
            // the server answers 200 with no liveSeason while it boots
            if (typeof response.data.liveSeason !== 'number') {
                throw new Error('The server is still loading seasons. Try again in a moment.');
            }
            return response.data;
        },
        staleTime: 5 * 60 * 1000,
        retry: 3,
        retryDelay: (attempt) => Math.min(2000 * 2 ** attempt, 10_000),
    });
}
