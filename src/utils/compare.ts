import type { Wld } from '@/types/compare';
import { formatHero, formatLabel, winRate } from '@/utils/format';

export const gamesOf = (r: Wld | undefined) => (r ? r[0] + r[1] + r[2] : 0);
export const rateOf = (r: Wld | undefined) => (r ? winRate(r[0], r[1]) : null);

export const formatRate = (rate: number | null, digits = 0) =>
    rate === null ? '–' : `${rate.toFixed(digits)}%`;

/** "5–3", or "5–3–1" when there are draws */
export const formatRecord = ([w, l, d]: Wld) => (d ? `${w}–${l}–${d}` : `${w}–${l}`);

export const recordTitle = ([w, l, d]: Wld) => `${w} won, ${l} lost, ${d} drawn`;

export const playerLabel = (
    p: { realName?: string | null | undefined; name?: string | null | undefined },
    fallback = 'Unknown player',
) => p.realName || p.name || fallback;

/** "Quincy|Alchemist,Druid,Ninja" → { hero: "Quincy", towers: [...] } */
export function parseLoadout(key: string) {
    const [hero = '', towers = ''] = key.split('|');
    return { hero, towers: towers.split(',').filter(Boolean) };
}

export function formatLoadout(key: string) {
    const { hero, towers } = parseLoadout(key);
    return { hero: formatHero(hero), towers: towers.map(formatLabel).join(', ') };
}

/** Red → green by win rate, for heat cells: 25% full red, 75% full green. */
export function rateColor(rate: number | null) {
    if (rate === null) return undefined;
    const t = Math.max(0, Math.min(1, (rate - 25) / 50));
    return `color-mix(in srgb, #2e9e62 ${Math.round(t * 100)}%, #e8364f)`;
}
