import { compareService } from '@/services/api/compare';
import { toError } from '@/services/api/utils';
import type { CompareSeason, Versus } from '@/types/compare';
import { keepPreviousData, queryOptions, useQuery } from '@tanstack/react-query';

interface VersusParams {
    season?: CompareSeason | undefined;
    vs?: string | undefined;
    top?: number | undefined;
}

export const versusQueryOptions = (userId: string, { season, vs, top }: VersusParams) =>
    queryOptions<Versus>({
        queryKey: ['versus', userId, season ?? 'live', vs ? `vs:${vs}` : `top:${top}`],
        queryFn: async () => {
            const response = await compareService.getVersus(userId, { season, vs, top });
            if (!response.success || !response.data) {
                throw toError(response, 'Could not load the head to head');
            }
            return response.data;
        },
        staleTime: 5 * 60_000,
        gcTime: 30 * 60_000,
    });

/** The player against one opponent or a top N, only the games between them. */
export default function useVersus(userId: string, params: VersusParams, enabled = true) {
    return useQuery({
        ...versusQueryOptions(userId, params),
        enabled: !!userId && enabled,
        placeholderData: keepPreviousData,
    });
}
