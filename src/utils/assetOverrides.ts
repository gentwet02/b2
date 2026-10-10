import etienneBee from '@/assets/images/heroes/etienne_bee.png';
import clubJammin from '@/assets/images/maps/club_jammin.png';
import { heroKey, mapKey } from '@/utils/format';

const HERO_IMAGES: Record<string, string> = {
    [heroKey('etienne_bee')]: etienneBee,
};

const MAP_IMAGES: Record<string, string> = {
    [mapKey('club_jammin')]: clubJammin,
};

export function heroImage(hero: string | undefined, url?: string): string | undefined {
    return (hero && HERO_IMAGES[heroKey(hero)]) || url;
}

export function mapImage(map: string | undefined, url?: string): string | undefined {
    return (map && MAP_IMAGES[mapKey(map)]) || url;
}
