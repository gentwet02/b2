import { previousRange, rangeLabel } from '@/config/ranges';
import { STATS_PLAYERS_DEFAULT } from '@/config/stats';
import { groupName } from '@/utils/compareTitles';
import type { Stats } from '@/types/stats';
import { formatLabel, formatNumber, lowerFirst } from '@/utils/format';
import { formatHero } from '@/utils/hero';
import { formatMap } from '@/utils/map';
import { playerLabel } from '@/utils/player';
import { seasonTitle } from '@/utils/season';

/** Who is counted, in words: "The top 25 of Season 47", "Bob in every season, against Alice". */
export function groupTitle(data: Stats) {
    const against = data.against;
    if (!against) return whoTitle(data);
    const group = groupName(against, data.season === 'all' ? null : data.seasons[0]?.boundsAgainst);
    // "the top 100", "ranks 26–100", "all HoM players"
    const them =
        against.mode === 'player'
            ? playerLabel(against, 'one player')
            : /^(Ranks|All)/.test(group)
              ? lowerFirst(group)
              : `the ${lowerFirst(group)}`;
    return `${whoTitle(data)}, against ${them}`;
}

function whoTitle(data: Stats) {
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
    let what = parts.length ? parts.join(' with ') : 'Every loadout';
    // sides filtered separately: "Quincy against Adora with Ninja"
    const theirs = data.filters2;
    if (theirs && (theirs.hero || theirs.towers.length > 0)) {
        const them = [
            theirs.hero && formatHero(theirs.hero.hero ?? theirs.hero.base),
            theirs.towers.length > 0 && theirs.towers.map(formatLabel).join(' + '),
        ].filter(Boolean);
        what += ` against ${them.join(' with ')}`;
    }
    if (!map) return what;
    const name = formatMap(data.labels.maps[map.base]?.map ?? map.base);
    return `${what} on ${name}${map.variant ? ` (${map.variant})` : ''}`;
}
