import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/queries/keys';
import { playerService } from '@/services/api/player';

/** Alias of a known player (from the server's name list), or null. */
export default function usePlayerName(playerId: string) {
    return useQuery({
        queryKey: queryKeys.playerName(playerId),
        queryFn: async () => {
            const response = await playerService.getPlayerName(playerId);
            return response.data?.player ?? null;
        },
        enabled: !!playerId,
        staleTime: Infinity,
    });
}
