import { useQuery } from '@tanstack/react-query';
import { playerService } from '@/services/api/player';
import type { ApiResponse } from '@/types/api';
import type { playerNameResponse } from '@/types/player';

export default function useLeaderboard(playerId: string) {
    return useQuery<ApiResponse<playerNameResponse>>({
        queryKey: ['player-name'],
        queryFn: async () => {
            const response = await playerService.getPlayerName(playerId);
            if (!response.success) throw new Error(`Failed to fetch player name for: ${playerId}`);
            console.log(`fetch player name for: ${playerId}`);
            return response;
        },
    });
}
