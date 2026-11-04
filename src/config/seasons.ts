/** First option of the season selects that can count every season together. */
export const ALL_SEASONS_OPTION = { value: 'all', label: 'All seasons' };

/** Seasons whose recorded matches have gaps, as shown in the UI ("Season 20"): marked with an asterisk. */
export const INCOMPLETE_SEASON_NUMBERS: readonly number[] = [20, 21, 24, 29, 31];

/** Seasons when NK's match history wasn't limited to Hall of Masters, as shown in the UI:
 *  their matches include some games played elsewhere, kept as they are.
 *  Mirrors the server's UNFILTERED_SEASONS (season ids, number - 1): change both. */
export const UNFILTERED_SEASON_NUMBERS: readonly number[] = [17, 18, 19, 20, 21, 40, 41, 42, 43];
