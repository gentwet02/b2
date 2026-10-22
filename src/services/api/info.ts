import { getFromApi } from '@/services/api/client';
import type { InfoResponse } from '@/types/info';

export const infoService = {
    getInfo: () => getFromApi<InfoResponse>('info'),
};
