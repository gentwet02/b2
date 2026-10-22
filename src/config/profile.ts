export const PROFILE_MATCH_AMOUNTS: readonly number[] = [5, 10, 20, 50];
export const PROFILE_MATCH_DEFAULT = 5;
export const PROFILE_SEASON_AMOUNTS: readonly number[] = [5, 10, 20, 50];
export const PROFILE_SEASON_DEFAULT = 5;

/** The profile's head to head card: games of this season, or of every season. */
export const H2H_SCOPES = [
    { value: 'season', label: 'This season' },
    { value: 'all', label: 'All seasons' },
] as const;
