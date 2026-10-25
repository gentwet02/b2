import { MAP_RENAMES } from '@/config/maps';

const REVERSED_MAP = /_reversed$/;

/** Map ids are snake_case: give every word a capital, like the game does. */
export function formatMap(map: string): string {
    return map
        .replace(/_(scene|map_01)$/, '')
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/** The current id of a map: "salmon_pool" → "salmon_ladder" (the version suffix is kept). */
export function currentMapId(map: string): string {
    const [, base = map, suffix = ''] = /^(.*?)(_reversed)?$/.exec(map) ?? [];
    return (MAP_RENAMES[base] ?? base) + suffix;
}

/** One key for every id of a map ("off_tide" / "offtide", "le_ruins" / "castle_ruins"…). */
export function mapKey(map: string): string {
    return currentMapId(map)
        .toLowerCase()
        .replace(/_(scene|map_01)$/, '')
        .replace(/_/g, '');
}

/** "oasis_reversed" is the reversed version of "oasis". */
export const isReversedMap = (map: string) => REVERSED_MAP.test(map);

/** Key of a map's base, both versions together: "oasis_reversed" → "oasis". */
export const mapBaseKey = (map: string) => mapKey(map.replace(REVERSED_MAP, ''));

/** The map filter that picks exactly this map: "oasis:reversed" or "oasis:classic". */
export const mapFilterOf = (map: string) =>
    `${mapBaseKey(map)}:${isReversedMap(map) ? 'reversed' : 'classic'}`;
