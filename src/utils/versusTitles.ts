import { COMPARE_RANGE_DEFAULT } from '@/config/compare';
import { previousRange, rangeLabel } from '@/config/ranges';
import type { Versus } from '@/types/compare';
import { lowerFirst } from '@/utils/format';
import { seasonTitle } from '@/utils/season';

/** Who a range versus is against: "Against the top 10 of Season 48", "Against ranks 11–25…". */
export function rangeTitle(data: Versus, bounds: Versus['seasons'][number]['bounds']) {
    const range = data.range ?? COMPARE_RANGE_DEFAULT;
    const where = data.season === 'all' ? 'each season' : seasonTitle(data.seasonName);
    if (data.band && bounds) return `Against ranks ${bounds.from}–${bounds.to} of ${where}`;
    const label = lowerFirst(rangeLabel(range));
    if (data.band) {
        const left = data.exclude ?? previousRange(range)?.value ?? '';
        return `Against the ${label} without the ${lowerFirst(rangeLabel(left))}, in each season`;
    }
    return range === 'all'
        ? `Against all HoM players of ${where}`
        : `Against the ${label} of ${where}`;
}
