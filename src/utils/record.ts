import { formatNumber } from '@/utils/format';
import type { RecordColumn, RecordRow, RecordSortKey, RecordSortState, Wld } from '@/types/record';

/** Win rate in %, draws left out; null without a win or a loss. */
export function winRate(wins: number, losses: number): number | null {
    const total = wins + losses;
    return total > 0 ? (wins / total) * 100 : null;
}

export const gamesOf = (r: Wld | undefined) => (r ? r[0] + r[1] + r[2] : 0);
export const rateOf = (r: Wld | undefined) => (r ? winRate(r[0], r[1]) : null);

export const formatRate = (rate: number | null, digits = 0) =>
    rate === null ? '–' : `${rate.toFixed(digits)}%`;

/** "5–3" (wins–losses), or "5–1–3" (wins–draws–losses) when there are draws */
export function formatRecord([w, l, d]: Wld) {
    const [fw, fl, fd] = [w, l, d].map(formatNumber);
    return d ? `${fw}–${fd}–${fl}` : `${fw}–${fl}`;
}

export const recordTitle = ([w, l, d]: Wld) =>
    `${formatNumber(w)} won, ${formatNumber(d)} drawn, ${formatNumber(l)} lost`;

/** `part` in % of `whole`, null when there is no whole. */
export const share = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : null);

/** "12%", "0.5%": one decimal under 10% */
export const formatShare = (value: number | null) =>
    value === null
        ? '–'
        : value >= 10 || value === 0
          ? `${value.toFixed(0)}%`
          : `${value.toFixed(1)}%`;

/** Most games first. */
export const compareGames = (a: { record: Wld }, b: { record: Wld }) =>
    gamesOf(b.record) - gamesOf(a.record);

/** Best win rate first (no rate last), then most games. */
export const compareRate = (a: { record: Wld }, b: { record: Wld }) =>
    (rateOf(b.record) ?? -1) - (rateOf(a.record) ?? -1) || compareGames(a, b);

/** Records as a list, most played first. */
export const pickList = (records: Record<string, Wld>): RecordRow[] =>
    Object.entries(records)
        .map(([key, record]) => ({ key, record }))
        .sort((a, b) => gamesOf(b.record) - gamesOf(a.record));

/** Best and worst win rate among the entries played at least `min` times (as the server does). */
export function pickExtremes(records: Record<string, Wld>, min: number) {
    const ok = pickList(records).filter(
        (p) => gamesOf(p.record) >= min && rateOf(p.record) !== null,
    );
    if (ok.length === 0) return { best: null, worst: null };
    const byRate = (dir: 1 | -1) => (p: RecordRow, q: RecordRow) =>
        dir * (rateOf(q.record)! - rateOf(p.record)!) || gamesOf(q.record) - gamesOf(p.record);
    const best = [...ok].sort(byRate(1))[0]!;
    const worst = [...ok].sort(byRate(-1))[0]!;
    // one entry, or all at the same rate: no worst
    return { best, worst: rateOf(worst.record)! < rateOf(best.record)! ? worst : null };
}

type Comparator<T> = (a: T, b: T) => number;

/** The order a RecordTable sort key stands for; undefined: keep the rows as given. */
export function recordComparator<T extends { record: Wld }>(
    key: RecordSortKey,
    labelSort: Comparator<T> | undefined,
    columns: RecordColumn<T>[],
): Comparator<T> | undefined {
    switch (key) {
        case 'games':
            return compareGames;
        case 'rate':
            return compareRate;
        case 'label':
            return labelSort;
        case 'none':
            return undefined;
        default:
            // "col:2": the extra column at that index
            return columns[Number(key.slice('col:'.length))]?.sort;
    }
}

/**
 * Rows in the sort's order (reversed: the opposite), ties broken by games.
 * Sorting by win rate, rows without one (draws only) stay last either way.
 */
export function sortRecords<T extends { record: Wld }>(
    rows: T[],
    sort: RecordSortState,
    compare: Comparator<T> | undefined,
): T[] {
    if (!compare) return rows;
    const dir = sort.reversed ? -1 : 1;
    return [...rows].sort((a, b) => {
        if (sort.key === 'rate') {
            const none = Number(rateOf(a.record) === null) - Number(rateOf(b.record) === null);
            if (none) return none;
        }
        return dir * compare(a, b) || compareGames(a, b);
    });
}
