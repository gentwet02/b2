import { useQuery } from '@tanstack/react-query';
import { playerService } from '@/services/api/player';

/** Real name of a known player (from the server's name list), or null. */
export default function usePlayerName(playerId: string) {
    return useQuery<string | null>({
        queryKey: ['playerName', playerId],
        queryFn: async () => {
            const response = await playerService.getPlayerName(playerId);
            return response.data?.player ?? null;
        },
        enabled: !!playerId,
        staleTime: Infinity,
    });
}
