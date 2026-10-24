import { NK_PROFILE_PREFIX } from '@/config/api';
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

/** The alias, unless it just repeats the in-game name ("Bob" for "Bob 2"). */
export function getAlias(player: Named): string | null {
    const name = player.name ?? player.displayName;
    if (!name || !player.alias) return null;
    return squash(player.alias).includes(squash(name)) ? null : player.alias;
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

/** "#3 Bob (Alias)", for leaderboard player pickers. */
export const rankedLabel = (p: Named & { rank: number }) => `#${formatNumber(p.rank)} ${nameWithAlias(p)}`;
