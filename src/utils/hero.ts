import type { HeroPick } from '@/types/hero';
import { formatLabel } from '@/utils/format';

export function heroKey(name: string): string {
    return name.toLowerCase().replace(/[_\s]/g, '');
}

/** "Quincy_Cyber" → "Cyber Quincy", the way the game names skins. */
export function formatHero(hero: string | undefined): string {
    if (!hero) return '';
    const [base, skin] = hero.split('_');
    const name = formatLabel(base || '');
    return skin ? `${formatLabel(skin)} ${name}` : name;
}

/** { base, hero } → "Quincy" or "Quincy:Quincy_Cyber" */
export const formatHeroPick = ({ base, hero }: HeroPick) => (hero ? `${base}:${hero}` : base);

/** "Quincy" or "Quincy:Quincy_Cyber" → { base, hero } */
export function parseHero(item: string): HeroPick {
    const [base = '', hero] = item.split(':');
    return hero ? { base, hero } : { base };
}
