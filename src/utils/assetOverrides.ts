import bonnie from '@/assets/images/heroes/bonnie.webp';
import etienneBee from '@/assets/images/heroes/etienne_bee.webp';
import { heroKey } from '@/utils/hero';
import { mapKey } from '@/utils/map';

const HERO_IMAGES: Record<string, string> = {
    [heroKey('bonnie')]: bonnie,
    [heroKey('etienne_bee')]: etienneBee,
};

/**
 * Our map pictures by map key: a file named after the map's current id ("bot_factory.webp") also
 * serves its old ids and variants ("bloon_bot_factory", "_scene").
 */
function byMapKey(files: Record<string, string>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(files).map(([path, url]) => [
            mapKey((path.split('/').pop() ?? path).replace(/\.\w+$/, '')),
            url,
        ]),
    );
}

const MAP_IMAGES = byMapKey(
    import.meta.glob<string>('../assets/images/maps/*.webp', { eager: true, import: 'default' }),
);
/** the same maps at 320px: full size is only worth it on the match cards */
const MAP_THUMBS = byMapKey(
    import.meta.glob<string>('../assets/images/maps/thumbs/*.webp', {
        eager: true,
        import: 'default',
    }),
);

function findMap(
    images: Record<string, string>,
    map: string | undefined,
    url: string | undefined,
): string | undefined {
    if (!map) return url;
    return images[mapKey(map)] || url || images[mapKey(map.replace(/_reversed$/, ''))];
}

export function heroImage(hero: string | undefined, url?: string): string | undefined {
    return (hero && HERO_IMAGES[heroKey(hero)]) || url;
}

/** Our picture of the map, NK's, or ours of the map it reverses ("oasis_reversed" → oasis). */
export function mapImage(map: string | undefined, url?: string): string | undefined {
    return findMap(MAP_IMAGES, map, url);
}

/** The same as `mapImage`, small: for thumbnails, chips and tiles. */
export function mapThumb(map: string | undefined, url?: string): string | undefined {
    return findMap(MAP_THUMBS, map, url);
}
