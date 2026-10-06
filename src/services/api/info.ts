import { getFromApi } from '@/services/api/utils';
import type { infoResponse } from '@/types/info';

export const infoService = {
    getInfo: () => getFromApi<infoResponse>('info'),
};
