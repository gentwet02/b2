/** Parts of each season's leaderboard a page can count (compare and stats). */
export const LEADERBOARD_RANGES = [
    { value: 't10', label: 'Top 10' },
    { value: 't25', label: 'Top 25' },
    { value: 't50', label: 'Top 50' },
    { value: 't100', label: 'Top 100' },
    { value: 't25p', label: 'Top 25%' },
    { value: 't50p', label: 'Top 50%' },
    { value: 't75p', label: 'Top 75%' },
    { value: 'all', label: 'All HoM players' },
] as const;

export type LeaderboardRange = (typeof LEADERBOARD_RANGES)[number]['value'];

export const rangeLabel = (range: string) =>
    LEADERBOARD_RANGES.find((r) => r.value === range)?.label ?? range;

/** The ranges listed before this one: what "leave out" can take off its top. */
export const rangesBefore = (range: string) => {
    const i = LEADERBOARD_RANGES.findIndex((r) => r.value === range);
    return i > 0 ? LEADERBOARD_RANGES.slice(0, i) : [];
};

/** The range before this one in the list (what the old ?band=1 left out), or null for the first. */
export const previousRange = (range: string) => rangesBefore(range).at(-1) ?? null;

/** `exclude` when it's a range listed before `range`, else undefined. */
export const validExclude = (range: string, exclude: unknown) =>
    rangesBefore(range).find((r) => r.value === exclude)?.value;

/** ?exclude=t10, or the old ?band=1 (the range listed before). */
export const parseExclude = (range: string, exclude: unknown, band: unknown) =>
    validExclude(range, exclude) ??
    (band === true || band === 1 || band === '1' || band === 'true'
        ? previousRange(range)?.value
        : undefined);
