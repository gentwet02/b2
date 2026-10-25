import type { Labels } from '@/types/compare';
import { formatLabel } from '@/utils/format';
import { formatHero } from '@/utils/hero';

/** "Quincy|Alchemist,Druid,Ninja" → { hero: "Quincy", towers: [...] } */
export function parseLoadout(key: string) {
    const [hero = '', towers = ''] = key.split('|');
    return { hero, towers: towers.split(',').filter(Boolean) };
}

/** { hero: "Cyber Quincy", towers: "Alchemist, Druid, Ninja" } */
export function formatLoadout(key: string) {
    const { hero, towers } = parseLoadout(key);
    return { hero: formatHero(hero), towers: towers.map(formatLabel).join(', ') };
}

/** One line of text for a loadout, to sort or search on. */
export function loadoutName(key: string) {
    const { hero, towers } = parseLoadout(key);
    return `${formatHero(hero)} ${towers.map(formatLabel).join(' ')}`;
}

/** "Alchemist,Druid,NinjaMonkey" → "Alchemist · Druid · Ninja Monkey" (with that separator). */
export const formatTowerList = (key: string, separator: string) =>
    key.split(',').map(formatLabel).join(separator);

/** Labels with the hero variants' portraits too, for loadout keys like "Quincy_Cyber|…". */
export function withVariantLabels(labels: Labels): Labels {
    if (!labels.variants) return labels;
    const variants = Object.entries(labels.variants).map(([hero, v]) => [
        hero,
        { hero, portrait: v.portrait },
    ]);
    return { ...labels, heroes: { ...labels.heroes, ...Object.fromEntries(variants) } };
}
