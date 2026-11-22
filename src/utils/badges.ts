import type { Badge, ProfileBadge } from '@/types/profile';
import { formatLabel } from '@/utils/format';
import { medalPicture } from '@/utils/gamePictures';
import { toRoman } from '@/utils/roman';
import { seasonLabel } from '@/utils/season';

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
export function medalLabel(badge: Badge) {
    return badge.season === null
        ? `Medal: ${badge.name}`
        : `${seasonLabel(badge.season - 1)} medal: ${badge.name}`;
}

/** The server's medals, to draw: their titles and our pictures. */
export function readBadges(badges: ProfileBadge[] | undefined): Badge[] {
    return (badges ?? []).map((badge, i) => ({
        key: `b${i}`,
        name: medalTitle(badge.name),
        picture: medalPicture(badge.name),
        season: badge.season,
    }));
}

/** Oldest season first, like the game's medal list. */
export const bySeason = (badges: Badge[]) =>
    [...badges].sort((a, b) => (a.season ?? -1) - (b.season ?? -1));

/** A Hall of Masters medal the server named for a rank, as a badge to draw. */
export function homMedalBadge(medal: { name: string; season: number }): Badge {
    return {
        key: medal.name,
        name: medalTitle(medal.name),
        picture: medalPicture(medal.name),
        season: medal.season,
    };
}
