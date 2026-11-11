import { CLAN_ID_PATTERN, USER_ID_PATTERN } from '@/config/player';
import { LEADERBOARD_RANGES, validExclude } from '@/config/ranges';
import type { SideItem } from '@/types/stats';
import { groupName } from '@/utils/compareTitles';

/**
 * A side's list: players, clans and ranges counted together, and the ones it leaves out. The
 * URL (and the server) write each item as a tag: "p:<user id>", "c:<clan id>", "r:t50" or
 * "r:t50-t10" (a range, one left out). "All HoM players" can be counted ("r:all", to leave
 * some of them out) but not left out, unless it leaves a range out itself ("r:all-t10"):
 * nothing would be left.
 */

export const playerTag = (id: string) => `p:${id}`;
export const clanTag = (id: string) => `c:${id}`;
export const rangeTag = (range: string, exclude?: string) =>
    `r:${range}${exclude ? `-${exclude}` : ''}`;

export function sideTag(item: SideItem) {
    if (item.kind === 'player') return playerTag(item.id);
    if (item.kind === 'clan') return clanTag(item.id);
    return rangeTag(item.range, item.exclude);
}

/** A tag, read: undefined when it isn't one. */
export function readSideTag(tag: string): SideItem | undefined {
    const kind = tag.slice(0, 2);
    const value = tag.slice(2);
    if (kind === 'p:') return USER_ID_PATTERN.test(value) ? { kind: 'player', id: value } : undefined;
    if (kind === 'c:') return CLAN_ID_PATTERN.test(value) ? { kind: 'clan', id: value } : undefined;
    if (kind !== 'r:') return undefined;
    const [range = '', exclude] = value.split('-');
    return LEADERBOARD_RANGES.some((r) => r.value === range)
        ? { kind: 'top', range, exclude: validExclude(range, exclude) }
        : undefined;
}

/**
 * "All HoM players" with nobody left out: a tag a side can't leave out. With a range left
 * out ("r:all-t10", everyone under the top 10) it can.
 */
export const isEveryone = (tag: string) => tag === 'r:all';

interface SideListRules {
    /** a tag left aside (the other side's one player or clan) */
    skip?: string | undefined;
    /** false: "All HoM players" with nobody left out isn't kept (?not=) */
    everyone?: boolean | undefined;
}

/** ?list=p:<id>,r:t10: the valid tags, each once, at most `max`. */
export function parseSideList(value: unknown, max: number, rules: SideListRules = {}) {
    const { skip, everyone = true } = rules;
    if (typeof value !== 'string') return undefined;
    const tags = value.split(',').flatMap((tag) => {
        const item = readSideTag(tag.trim());
        return item ? [sideTag(item)] : [];
    });
    const kept = [...new Set(tags)]
        .filter((tag) => tag !== skip && (everyone || !isEveryone(tag)))
        .slice(0, max);
    return kept.length ? kept.join(',') : undefined;
}

/** The player or clan ids of a list. */
export function listedIds(tags: string[], kind: 'player' | 'clan') {
    return new Set(
        tags.flatMap((tag) => {
            const item = readSideTag(tag);
            return item && item.kind === kind ? [item.id] : [];
        }),
    );
}

/** A range in the list: the side is as big as a range (no games list for two of them). */
export const listsRange = (tags: string[]) => tags.some((tag) => tag.startsWith('r:'));

/** What a tag's chip says: the player's or the clan's name (by id), or the range. */
export function sideTagLabel(tag: string, names: Record<string, string>) {
    const item = readSideTag(tag);
    if (!item) return tag;
    if (item.kind === 'player') return names[item.id] ?? 'Player';
    if (item.kind === 'clan') return names[item.id] ?? 'Clan';
    return groupName({
        mode: 'top',
        userId: null,
        name: null,
        alias: null,
        range: item.range,
        exclude: item.exclude ?? null,
    });
}
