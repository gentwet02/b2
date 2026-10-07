/** GET /players/:id — known players answer { id, player }, unknown ones { error } (status 200). */
export interface playerNameResponse {
    id?: string;
    player?: string;
    message?: string | null;
    error?: string | null;
}
