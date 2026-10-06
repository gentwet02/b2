import { infoService } from '@/services/api/info';
import type { ApiResponse } from '@/types/api';
import type { infoResponse } from '@/types/info';
import { useQuery } from '@tanstack/react-query';

export default function useSeasons() {
    return useQuery<ApiResponse<infoResponse>>({
        queryKey: ['liveSeason'],
        queryFn: async () => {
            const response = await infoService.getInfo();
            if (!response.success) throw new Error('Failed to fetch live season');
            console.log('fetch live season');
            return response;
        },
    });
}
