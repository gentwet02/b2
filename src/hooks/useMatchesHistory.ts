import { matchesService } from '@/services/api/matchesHistory';
import type { ApiResponse } from '@/types/api';
import type { MatchesResponse } from '@/types/match';
import { useQuery } from '@tanstack/react-query';

export default function useMatchesHistory() {
    return useQuery<ApiResponse<MatchesResponse>>({
        queryKey: ['matchesHistory'],
        queryFn: async () => {
            const response = await matchesService.getMatchesRecentHistory();
            if (!response.success) throw new Error('Failed to fetch leaderboard');
            console.log('fetch matches history');
            return response;
        },
    });
}
