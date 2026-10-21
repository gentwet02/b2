import type { H2hPick, HeadToHead, Wld } from '@/types/compare';
import {
    formatHero,
    formatLabel,
    isReversedMap,
    mapBaseKey,
    seasonTitle,
    winRate,
} from '@/utils/format';

export const gamesOf = (r: Wld | undefined) => (r ? r[0] + r[1] + r[2] : 0);
export const rateOf = (r: Wld | undefined) => (r ? winRate(r[0], r[1]) : null);

export const formatRate = (rate: number | null, digits = 0) =>
    rate === null ? '–' : `${rate.toFixed(digits)}%`;

/** "5–3", or "5–3–1" when there are draws */
export const formatRecord = ([w, l, d]: Wld) => (d ? `${w}–${l}–${d}` : `${w}–${l}`);

export const recordTitle = ([w, l, d]: Wld) => `${w} won, ${l} lost, ${d} drawn`;

export const playerLabel = (
    p: { alias?: string | null | undefined; name?: string | null | undefined },
    fallback = 'Unknown player',
) => p.alias || p.name || fallback;

/** "Quincy|Alchemist,Druid,Ninja" → { hero: "Quincy", towers: [...] } */
export function parseLoadout(key: string) {
    const [hero = '', towers = ''] = key.split('|');
    return { hero, towers: towers.split(',').filter(Boolean) };
}

export function formatLoadout(key: string) {
    const { hero, towers } = parseLoadout(key);
    return { hero: formatHero(hero), towers: towers.map(formatLabel).join(', ') };
}

/** "in Season 47" / "in any season", for sentences about the games counted. */
export const inScope = (d: { season: number | 'all'; seasonName: string }) =>
    d.season === 'all' ? 'in any season' : `in ${seasonTitle(d.seasonName)}`;

type Labels = HeadToHead['labels'];

/**
 * Classic and reversed versions of each map together ("oasisreversed" counted in "oasis").
 * `hasReversed`: whether there was a reversed map to merge at all.
 */
export function mergeMapVersions(maps: Record<string, Wld>, labels: Labels) {
    const merged: Record<string, Wld> = {};
    const mapLabels: Labels['maps'] = { ...labels.maps };
    let hasReversed = false;
    for (const [key, record] of Object.entries(maps)) {
        const raw = labels.maps[key]?.map ?? key;
        let base = key;
        if (isReversedMap(raw)) {
            hasReversed = true;
            base = mapBaseKey(raw);
            mapLabels[base] ??= {
                map: raw.replace(/_reversed$/, ''),
                image: labels.maps[key]?.image ?? null,
            };
        }
        const total = merged[base] ?? [0, 0, 0];
        merged[base] = [total[0] + record[0], total[1] + record[1], total[2] + record[2]];
    }
    return { maps: merged, labels: { ...labels, maps: mapLabels }, hasReversed };
}

/** Records as a list, most played first. */
export const pickList = (records: Record<string, Wld>): H2hPick[] =>
    Object.entries(records)
        .map(([key, record]) => ({ key, record }))
        .sort((a, b) => gamesOf(b.record) - gamesOf(a.record));

/** Best and worst win rate among the entries played at least `min` times (as the server does). */
export function pickExtremes(records: Record<string, Wld>, min: number) {
    const ok = pickList(records).filter(
        (p) => gamesOf(p.record) >= min && rateOf(p.record) !== null,
    );
    if (ok.length === 0) return { best: null, worst: null };
    const byRate = (dir: 1 | -1) => (p: H2hPick, q: H2hPick) =>
        dir * (rateOf(q.record)! - rateOf(p.record)!) || gamesOf(q.record) - gamesOf(p.record);
    const best = [...ok].sort(byRate(1))[0]!;
    const worst = [...ok].sort(byRate(-1))[0]!;
    // one entry, or all at the same rate: no worst
    return { best, worst: rateOf(worst.record)! < rateOf(best.record)! ? worst : null };
}
