import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/hooks/queries/keys';
import { playerService } from '@/services/api/player';

/** Alias and tag of a known player (from the server's name and tag lists), or null. */
export default function usePlayerName(playerId: string) {
    return useQuery({
        queryKey: queryKeys.playerName(playerId),
        queryFn: async () => {
            const response = await playerService.getPlayerName(playerId);
            const known = response.data;
            return known?.player ? { alias: known.player, tag: known.tag ?? null } : null;
        },
        enabled: !!playerId,
        staleTime: Infinity,
    });
}
