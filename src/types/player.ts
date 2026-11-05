import type { PLAYER_TAG_LABELS } from '@/config/player';
import type { BaseApiResponse } from '@/types/api';

export type PlayerTag = keyof typeof PLAYER_TAG_LABELS;

/** GET /players/:id — known players answer { id, player }, unknown ones { error } (status 200). */
export interface PlayerNameResponse extends BaseApiResponse {
    id?: string;
    player?: string;
    tag?: PlayerTag;
}
