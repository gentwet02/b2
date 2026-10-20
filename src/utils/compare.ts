import type { Wld } from '@/types/compare';
import { formatHero, formatLabel, seasonTitle, winRate } from '@/utils/format';

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
