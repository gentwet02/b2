import { getFromApi } from '@/services/api/client';
import type { ClanData, ClanOverview, ClansList } from '@/types/clan';

export const clanService = {
    getClans: () => getFromApi<ClansList>('clans'),
    getClan: (clanId: string) => getFromApi<ClanData>(`clans/${clanId}`),
    getOverview: (clanId: string) => getFromApi<ClanOverview>(`clans/${clanId}/overview`),
};
