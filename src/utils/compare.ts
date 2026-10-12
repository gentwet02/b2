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

/**
 * Heat cell background: red below 50%, green above, fading to the paper color at 50%
 */
export function rateColor(rate: number | null) {
    if (rate === null) return undefined;
    const strength = Math.min(1, Math.abs(rate - 50) / 25);
    const hue = rate >= 50 ? '#2e9e62' : '#e8364f';
    return `color-mix(in srgb, ${hue} ${Math.round(12 + strength * 53)}%, #fffdf7)`;
}

/** "in Season 47" / "in any season", for sentences about the games counted. */
export const inScope = (d: { season: number | 'all'; seasonName: string }) =>
    d.season === 'all' ? 'in any season' : `in ${d.seasonName.replace(' Event', '')}`;
