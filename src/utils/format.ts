const numberFormat = new Intl.NumberFormat();
export const formatNumber = (value: number) => numberFormat.format(value);

/** "1 game", "3 games" */
export const plural = (count: number, word: string, many = `${word}s`) =>
    count === 1 ? word : many;

/** "Top 25" → "top 25", to use a label inside a sentence. */
export const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

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

export function formatDuration(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = Math.round(seconds % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
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
