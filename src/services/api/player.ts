import { getFromApi } from '@/services/api/client';
import type { PlayerNameResponse } from '@/types/player';

export const playerService = {
    getPlayerName: (playerId: string) => getFromApi<PlayerNameResponse>(`players/${playerId}`),
};
