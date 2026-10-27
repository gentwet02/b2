import { rangeLabel } from '@/config/ranges';
import { STATS_PLAYERS_DEFAULT } from '@/config/stats';
import type { Comparison, CompareSideKey, CompareSideInfo, RankBounds } from '@/types/compare';
import { formatLabel, formatNumber, lowerFirst } from '@/utils/format';
import { formatHero, parseHero } from '@/utils/hero';
import { formatMap } from '@/utils/map';
import { splitList } from '@/utils/search';
import { playerLabel } from '@/utils/player';

/** Ranks a group side counted in the season shown (one season only). */
export const sideBounds = (data: Comparison, key: CompareSideKey): RankBounds | null => {
    if (data.season === 'all') return null;
    const row = data.seasons[0];
    return (key === 'a' ? row?.boundsA : row?.bounds) ?? null;
};

/** "Top 10", "Top 50 without the top 10", one season: "Ranks 11–50". */
export function groupName(side: CompareSideInfo, bounds?: RankBounds | null) {
    const range = side.range ?? STATS_PLAYERS_DEFAULT;
    if (side.exclude && bounds && bounds.from <= bounds.to) {
        return `Ranks ${formatNumber(bounds.from)}–${formatNumber(bounds.to)}`;
    }
    const label = range === 'all' ? 'All HoM players' : rangeLabel(range);
    return side.exclude ? `${label} without the ${lowerFirst(rangeLabel(side.exclude))}` : label;
}

/** What a side is called: the player's name, its range, or "Anyone". */
export function sideName(data: Comparison, key: CompareSideKey) {
    const side = data[key];
    if (side.mode === 'anyone') return 'Anyone';
    if (side.mode === 'player') {
        const member = (key === 'a' ? data.players : data.opponents)[0];
        return playerLabel(side.name || side.alias ? side : (member ?? {}), 'Unknown player');
    }
    return groupName(side, sideBounds(data, key));
}

/** "Bob’s", or the range as is: "Top 10" (to put before a noun). */
export const sidePossessive = (data: Comparison, key: CompareSideKey) =>
    data[key].mode === 'player'
        ? `${sideName(data, key)}’s`
        : data[key].mode === 'anyone'
          ? 'Opponent'
          : // "All HoM players’ loadout", "Top 25 loadout"
            sideName(data, key).replace(/s$/, 's’');

/** Both sides are the same range (the same ranks each season). */
export const sameSides = (data: Comparison) =>
    data.a.mode === 'top' &&
    data.b.mode === 'top' &&
    data.a.range === data.b.range &&
    (data.a.exclude ?? null) === (data.b.exclude ?? null);

/** Both sides are ranges that share players (those play for side 1). */
export function sidesOverlap(data: Comparison) {
    if (data.a.mode !== 'top' || data.b.mode !== 'top') return false;
    return data.seasons.some((s) => {
        const a = s.boundsA;
        const b = s.bounds;
        return !!a && !!b && a.from <= b.to && b.from <= a.to;
    });
}

/**
 * One season, two overlapping ranges: what side 2 really counts once side 1's players
 * are taken out ("ranks 11–50"), or null when that isn't a single block of ranks.
 */
export function side2Effective(data: Comparison) {
    if (!sidesOverlap(data) || data.overlap !== false || data.season === 'all') return null;
    const a = data.seasons[0]?.boundsA;
    const b = data.seasons[0]?.bounds;
    if (!a || !b) return null;
    if (a.from <= b.from && a.to < b.to) return { from: a.to + 1, to: b.to };
    if (a.to >= b.to && a.from > b.from) return { from: b.from, to: a.from - 1 };
    return null;
}

interface FocusSearch {
    map?: string | undefined;
    exMaps?: string | undefined;
    hero?: string | undefined;
    towers?: string | undefined;
    exHeroes?: string | undefined;
    exTowers?: string | undefined;
    sides?: true | undefined;
    hero2?: string | undefined;
    towers2?: string | undefined;
    exHeroes2?: string | undefined;
    exTowers2?: string | undefined;
}

/** "Quincy with Druid + Ninja", or null without a hero or towers. */
function loadoutText(hero: string | undefined, towers: string | undefined) {
    const pick = hero ? parseHero(hero) : undefined;
    const parts = [
        pick && formatHero(pick.hero ?? pick.base),
        splitList(towers).map(formatLabel).join(' + '),
    ].filter(Boolean);
    return parts.length ? parts.join(' with ') : null;
}

/**
 * What the map, hero and tower filters keep, for the players tabs' notes:
 * ["Top 25 on Quincy", "All HoM players on Adora", "on Oasis (reversed)", "some heroes left out"].
 */
export function focusParts(data: Comparison, search: FocusSearch) {
    const parts: string[] = [];
    const own = loadoutText(search.hero, search.towers);
    if (own) parts.push(`${sideName(data, 'a')} on ${own}`);
    const theirs = search.sides ? loadoutText(search.hero2, search.towers2) : null;
    if (theirs) parts.push(`${sideName(data, 'b')} on ${theirs}`);
    if (search.map) {
        const [key = '', variant] = search.map.split(':');
        const name = formatMap(data.labels.maps[key]?.map ?? key);
        parts.push(`on ${name}${variant ? ` (${variant})` : ''}`);
    }
    const left = [
        (search.exHeroes || (search.sides && search.exHeroes2)) && 'heroes',
        (search.exTowers || (search.sides && search.exTowers2)) && 'towers',
        search.exMaps && 'maps',
    ].filter(Boolean);
    if (left.length) parts.push(`some ${left.join(', ')} left out`);
    return parts;
}
