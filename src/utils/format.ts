const PROFILE_PREFIX = 'https://data.ninjakiwi.com/battles2/users/';

export function extractUserId(profileUrl: string): string {
    return profileUrl.replace(PROFILE_PREFIX, '').replace(/\/.*$/, '');
}

const numberFormat = new Intl.NumberFormat();
export const formatNumber = (value: number) => numberFormat.format(value);

/** "DartMonkey" → "Dart Monkey", "thin_ice" → "Thin ice", "MOAB" stays "MOAB". */
export function formatLabel(value: string): string {
    const words = value
        .replace(/_/g, ' ')
        .replace(/HoM/g, ' \u0000 ') // keep the game's "HoM" acronym in one piece
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
        // eslint-disable-next-line no-control-regex
        .replace(/\u0000/g, 'HoM')
        .replace(/\s+/g, ' ')
        .trim();
    return words.charAt(0).toUpperCase() + words.slice(1);
}

/** Map ids are snake_case: give every word a capital, like the game does. */
export function formatMap(map: string): string {
    return map
        .replace(/_(scene|map_01)$/, '')
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/** "Quincy_Cyber" → "Cyber Quincy", the way the game names skins. */
export function formatHero(hero: string): string {
    const [base, skin] = hero.split('_');
    const name = formatLabel(base || 'unknown');
    return skin ? `${formatLabel(skin)} ${name}` : name;
}

export function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
}

export function winRate(wins: number, losses: number): number | null {
    const total = wins + losses;
    return total > 0 ? (wins / total) * 100 : null;
}

const relative = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' });

export function timeAgo(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    const ms = new Date(date).getTime();
    if (Number.isNaN(ms)) return null;
    const minutes = Math.round((ms - Date.now()) / 60_000);
    if (Math.abs(minutes) < 60) return relative.format(minutes, 'minute');
    const hours = Math.round(minutes / 60);
    if (Math.abs(hours) < 48) return relative.format(hours, 'hour');
    return relative.format(Math.round(hours / 24), 'day');
}

export const seasonLabel = (seasonId: number) => `Season ${seasonId + 1}`;
