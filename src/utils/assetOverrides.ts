import bonnie from '@/assets/images/heroes/bonnie.webp';
import etienneBee from '@/assets/images/heroes/etienne_bee.webp';
import { heroKey } from '@/utils/hero';
import { mapKey } from '@/utils/map';

const HERO_IMAGES: Record<string, string> = {
    [heroKey('bonnie')]: bonnie,
    [heroKey('etienne_bee')]: etienneBee,
};

/**
 * Our map pictures (assets/images/maps), by map key: a file named after the map's current id
 * ("bot_factory.webp") also serves its old ids and variants ("bloon_bot_factory", "_scene").
 */
const MAP_IMAGES: Record<string, string> = Object.fromEntries(
    Object.entries(
        import.meta.glob<string>('../assets/images/maps/*.webp', { eager: true, import: 'default' }),
    ).map(([path, url]) => [mapKey((path.split('/').pop() ?? path).replace(/\.\w+$/, '')), url]),
);

export function heroImage(hero: string | undefined, url?: string): string | undefined {
    return (hero && HERO_IMAGES[heroKey(hero)]) || url;
}

/** Our picture of the map, NK's, or ours of the map it reverses ("oasis_reversed" → oasis). */
export function mapImage(map: string | undefined, url?: string): string | undefined {
    if (!map) return url;
    return MAP_IMAGES[mapKey(map)] || url || MAP_IMAGES[mapKey(map.replace(/_reversed$/, ''))];
}
