import etienneBee from '@/assets/images/heroes/etienne_bee.png';
import clubJammin from '@/assets/images/maps/club_jammin.png';

const normalize = (name: string) => name.toLowerCase().replace(/[_\s]/g, '');

const HERO_IMAGES: Record<string, string> = {
    [normalize('etienne_bee')]: etienneBee,
};

const MAP_IMAGES: Record<string, string> = {
    [normalize('club_jammin')]: clubJammin,
};

const mapKey = (map: string) => normalize(map.replace(/_(scene|map_01)$/i, ''));

export function heroImage(hero: string | undefined, url?: string): string | undefined {
    return (hero && HERO_IMAGES[normalize(hero)]) || url;
}

export function mapImage(map: string | undefined, url?: string): string | undefined {
    return (map && MAP_IMAGES[mapKey(map)]) || url;
}
