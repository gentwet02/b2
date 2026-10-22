import type { BaseApiResponse } from '@/types/api';

/** GET /players/:id — known players answer { id, player }, unknown ones { error } (status 200). */
export interface PlayerNameResponse extends BaseApiResponse {
    id?: string;
    player?: string;
}
