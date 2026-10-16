export const COMPARE_SLOTS = 10;

export const COMPARE_RANGES = [
    { value: 't10', label: 'Top 10' },
    { value: 't25', label: 'Top 25' },
    { value: 't50', label: 'Top 50' },
    { value: 't100', label: 'Top 100' },
    { value: 't25p', label: 'Top 25%' },
    { value: 't50p', label: 'Top 50%' },
    { value: 't75p', label: 'Top 75%' },
    { value: 'all', label: 'All HoM players' },
] as const;

export type CompareRange = (typeof COMPARE_RANGES)[number]['value'];
export const COMPARE_RANGE_DEFAULT: CompareRange = 't10';

export const rangeLabel = (range: string) =>
    COMPARE_RANGES.find((r) => r.value === range)?.label ?? range;

/** The range before this one in the list (what the band leaves out), or null for the first. */
export const previousRange = (range: string) => {
    const i = COMPARE_RANGES.findIndex((r) => r.value === range);
    return i > 0 ? COMPARE_RANGES[i - 1] : null;
};
