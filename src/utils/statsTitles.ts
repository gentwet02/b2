import { previousRange, rangeLabel } from '@/config/ranges';
import { STATS_PLAYERS_DEFAULT } from '@/config/stats';
import type { Stats } from '@/types/stats';
import { formatLabel, formatNumber, lowerFirst } from '@/utils/format';
import { formatHero } from '@/utils/hero';
import { formatMap } from '@/utils/map';
import { playerLabel } from '@/utils/player';
import { seasonTitle } from '@/utils/season';

/** Who is counted, in words: "The top 25 of Season 47", "Bob in every season". */
export function groupTitle(data: Stats) {
    const where = data.season === 'all' ? 'every season' : seasonTitle(data.seasonName);
    if (data.mode === 'player' && data.player) return `${playerLabel(data.player)} in ${where}`;
    const range = data.players ?? STATS_PLAYERS_DEFAULT;
    const label = lowerFirst(rangeLabel(range));
    const bounds = data.season === 'all' ? null : data.seasons[0]?.bounds;
    if (data.band && bounds) return `Ranks ${formatNumber(bounds.from)}–${formatNumber(bounds.to)} of ${where}`;
    if (data.band) {
        const left = data.exclude ?? previousRange(range)?.value ?? '';
        return `The ${label} without the ${lowerFirst(rangeLabel(left))}, in ${where}`;
    }
    return range === 'all' ? `All HoM players of ${where}` : `The ${label} of ${where}`;
}

/** What the numbers are about: "Quincy with Alchemist + Druid on Oasis (reversed)". */
export function focusTitle(data: Stats) {
    const { hero, towers, map } = data.filters;
    const parts = [
        hero && formatHero(hero.hero ?? hero.base),
        towers.length > 0 && towers.map(formatLabel).join(' + '),
    ].filter(Boolean);
    const what = parts.length ? parts.join(' with ') : 'Every loadout';
    if (!map) return what;
    const name = formatMap(data.labels.maps[map.base]?.map ?? map.base);
    return `${what} on ${name}${map.variant ? ` (${map.variant})` : ''}`;
}
