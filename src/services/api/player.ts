import type { playerNameResponse } from '@/types/player';
import { getFromApi } from '@/services/api/utils';

export const playerService = {
    getPlayerName: (playerId: string) => getFromApi<playerNameResponse>(`players/${playerId}`),
};
