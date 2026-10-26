import type { Badge } from '@/types/profile';
import { formatLabel } from '@/utils/format';
import { toRoman } from '@/utils/roman';
import { seasonLabel } from '@/utils/season';

const IMAGE_URL = /^https?:\/\/\S+\.(png|jpe?g|webp|gif|svg)(\?\S*)?$/i;

/** NK's arena codes in medal names → what the game calls them. */
const ARENAS: Record<string, string> = {
    Master: 'Hall of Masters',
    ZOMG: 'ZOMG Superdome',
    BFB: 'BFB Colosseum',
    MOAB: 'MOAB Pit',
    CERAMIC: 'Ceramic Crucible',
    LEAD: 'Lead Dungeon',
    WHITE: 'White Wasteland',
    YELLOW: 'Yellow Stadium',
};

/** The game's name of an arena code, whatever its case ("Ceramic", "CERAMIC", "hom"). */
export function arenaName(code: string): string {
    const wanted = code.toLowerCase() === 'hom' ? 'master' : code.toLowerCase();
    const key = Object.keys(ARENAS).find((k) => k.toLowerCase() === wanted);
    return key ? ARENAS[key]! : `${formatLabel(code)} arena`;
}

/**
 * What a medal was earned for, from NK's name:
 *   "Arena_MOAB"                → "MOAB Pit"
 *   "Arena_Master_Top50Percent" → "Top 50% of the Hall of Masters"
 *   "Arena_Master_Top100"       → "Top 100 of the Hall of Masters"
 *   "Arena_Master_1st"          → "1st in the Hall of Masters"
 */
export function medalTitle(name: string): string {
    const match = /^Arena_([A-Za-z]+)(?:_(.+))?$/.exec(name);
    if (!match) return formatLabel(name);
    const [, code = '', rank] = match;
    const arena = arenaName(code);
    if (!rank) return `${arena}`;
    const percent = /^Top(\d+)Percent$/i.exec(rank);
    if (percent) return `Top ${percent[1]}% of the ${arena}`;
    const top = /^Top(\d+)$/i.exec(rank);
    if (top) return `Top ${top[1]} of the ${arena}`;
    if (/^\d+(st|nd|rd|th)$/i.test(rank)) return `${rank.toLowerCase()} in the ${arena}`;
    return `${arena}, ${formatLabel(rank)}`;
}

/**
 * The numeral on the medal's ribbon. A medal's season is the real season
 * number (our season ids are one less): 46 → "XLVI".
 */
export const medalNumeral = (season: number | null) => (season === null ? '' : toRoman(season));

/** Tooltip and alt text: "Season 46 medal: Top 50% of the Hall of Masters" */
export const medalLabel = (badge: Badge) =>
    badge.season === null
        ? `Medal: ${badge.name}`
        : `${seasonLabel(badge.season - 1)} medal: ${badge.name}`;

/** Badges (medals) as NK sends them, read defensively (see Badge). */
export function readBadges(raw: unknown[] | undefined): Badge[] {
    return (raw ?? []).flatMap((item, i): Badge[] => {
        if (typeof item === 'string') {
            return IMAGE_URL.test(item)
                ? [{ key: `b${i}`, url: item, name: 'Unknown medal', season: null }]
                : [{ key: `b${i}`, name: medalTitle(item), season: null }];
        }
        if (item && typeof item === 'object') {
            const values = Object.entries(item as Record<string, unknown>);
            const url = values.find(([, v]) => typeof v === 'string' && IMAGE_URL.test(v))?.[1] as
                | string
                | undefined;
            const nameField = values.find(
                ([k, v]) => typeof v === 'string' && /^(name|badge|type|id)$/i.test(k),
            )?.[1] as string | undefined;
            const rawSeason = (item as { season?: unknown }).season;
            const season =
                typeof rawSeason === 'number' && Number.isFinite(rawSeason) ? rawSeason : null;
            const name = nameField ? medalTitle(nameField) : 'Unknown medal';
            return url || nameField ? [{ key: `b${i}`, url, name, season }] : [];
        }
        return [];
    });
}

/** Oldest season first, like the game's medal list. */
export const bySeason = (badges: Badge[]) =>
    [...badges].sort((a, b) => (a.season ?? -1) - (b.season ?? -1));
