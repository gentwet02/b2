import { NK_PROFILE_PREFIX } from '@/config/api';
import type { DropdownKeyword } from '@/types/dropdown';
import { formatNumber } from '@/utils/format';

/** NK's profile URL → the player's id. */
export function extractUserId(profileUrl: string): string {
    return profileUrl.replace(NK_PROFILE_PREFIX, '').replace(/\/.*$/, '');
}

interface Named {
    alias?: string | null | undefined;
    name?: string | null | undefined;
    displayName?: string | null | undefined;
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

/** "Bob (Alias)" */
export function nameWithAlias(p: Named): string {
    const alias = getAlias(p);
    const name = p.name ?? p.displayName ?? '';
    return alias ? `${name} (${alias})` : name;
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
    return keywords.find((k) => k.text.toLowerCase().includes(needle));
}

/** "#3 Bob (Alias)", for leaderboard player pickers. */
export const rankedLabel = (p: Named & { rank: number }) => `#${formatNumber(p.rank)} ${nameWithAlias(p)}`;
