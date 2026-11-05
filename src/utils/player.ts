import { NK_PROFILE_PREFIX } from '@/config/api';
import { PLAYER_TAG_LABELS, TAG_SEARCH_MIN_LENGTH } from '@/config/player';
import type { DropdownKeyword } from '@/types/dropdown';
import type { PlayerTag } from '@/types/player';
import { formatNumber } from '@/utils/format';

/** NK's profile URL → the player's id. */
export function extractUserId(profileUrl: string): string {
    return profileUrl.replace(NK_PROFILE_PREFIX, '').replace(/\/.*$/, '');
}

interface Named {
    alias?: string | null | undefined;
    name?: string | null | undefined;
    displayName?: string | null | undefined;
    tag?: PlayerTag | null | undefined;
}

const squash = (text: string) => text.replace(/\s+/g, '').toLowerCase();

/**
 * The alias, unless it is the in-game name with other case or spacing ("paypur -rng" for
 * "Paypur -rng"). An alias that only contains the name still shows ("The Player" for "player").
 */
export function getAlias(player: Named): string | null {
    const name = player.name ?? player.displayName;
    if (!name || !player.alias) return null;
    return squash(player.alias) === squash(name) ? null : player.alias;
}

/** The name to show: the alias first. */
export const playerLabel = (p: Named, fallback = 'Unknown player') =>
    p.alias || p.name || p.displayName || fallback;

/** The alias line under a name: "Alias (Nuker)", "(Nuker)" without an alias. */
export function aliasWithTag(player: Named): string | null {
    const alias = getAlias(player);
    if (!player.tag) return alias;
    const tag = `(${PLAYER_TAG_LABELS[player.tag]})`;
    return alias ? `${alias} ${tag}` : tag;
}

/** "Bob (Alias)", "Bob (Alias, Nuker)" */
export function nameWithAlias(p: Named): string {
    const extras = [getAlias(p), p.tag && PLAYER_TAG_LABELS[p.tag]].filter(Boolean);
    const name = p.name ?? p.displayName ?? '';
    return extras.length > 0 ? `${name} (${extras.join(', ')})` : name;
}

/**
 * A player's other names as search keywords: their current name (on a past season's
 * leaderboard) always, their old names when the old-names search is on.
 */
export function nameKeywords(
    player: { currentName?: string | undefined; oldNames?: string[] | undefined },
    withOldNames: boolean,
): DropdownKeyword[] {
    return [
        ...(player.currentName ? [{ text: player.currentName, note: 'current name' }] : []),
        ...(withOldNames ? (player.oldNames ?? []) : []).map((text) => ({ text, note: 'old name' })),
    ];
}

interface Searchable extends Named {
    currentName?: string | undefined;
    oldNames?: string[] | undefined;
}

/** Whether a lowercased search finds this keyword. */
export function keywordHit(keyword: DropdownKeyword, needle: string) {
    const text = keyword.text.toLowerCase();
    if (needle.length < (keyword.minSearch ?? 1)) return false;
    if (keyword.match === 'whole') return text === needle;
    if (keyword.match === 'start') return text.startsWith(needle);
    return text.includes(needle);
}

/**
 * Everything a player search finds a player by besides the shown name and alias: their other
 * names, their tag (its start, from TAG_SEARCH_MIN_LENGTH characters) and their whole id.
 */
export function playerKeywords(
    player: Searchable,
    id: string,
    withOldNames: boolean,
): DropdownKeyword[] {
    return [
        ...nameKeywords(player, withOldNames),
        ...(player.tag
            ? [
                  {
                      text: PLAYER_TAG_LABELS[player.tag],
                      note: 'tag',
                      match: 'start' as const,
                      minSearch: TAG_SEARCH_MIN_LENGTH,
                  },
              ]
            : []),
        { text: id, note: 'id', match: 'whole' as const },
    ];
}

/**
 * The one player search rule (tables, pickers, and the server's `findPlayerCodes` for matches):
 * name, alias, tag, current or old names, or whole id.
 */
export function playerMatches(
    player: Searchable,
    id: string,
    term: string,
    withOldNames: boolean,
): boolean {
    const needle = term.trim().toLowerCase();
    if (!needle) return true;
    const shown = [player.name, player.displayName, player.alias];
    return (
        shown.some((text) => !!text && text.toLowerCase().includes(needle)) ||
        playerKeywords(player, id, withOldNames).some((k) => keywordHit(k, needle))
    );
}

/**
 * The keyword `term` found, when the shown text doesn't already contain it: the other name to
 * point out next to a search result.
 */
export function matchedKeyword(
    shown: string,
    keywords: readonly DropdownKeyword[],
    term: string | undefined,
): DropdownKeyword | undefined {
    const needle = term?.trim().toLowerCase();
    if (!needle || shown.toLowerCase().includes(needle)) return undefined;
    return keywords.find((k) => keywordHit(k, needle));
}

/** "#3 Bob (Alias)", for leaderboard player pickers. */
export const rankedLabel = (p: Named & { rank: number }) => `#${formatNumber(p.rank)} ${nameWithAlias(p)}`;
