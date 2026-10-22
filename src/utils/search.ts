import { USER_ID_PATTERN } from '@/config/player';
import type { SeasonScope } from '@/types/season';

/**
 * Readers for URL search params: each returns the value when it's valid,
 * undefined otherwise, so the param is dropped from the URL.
 */

/** Comma lists in the URL ("Druid,Alchemist") ⇄ arrays. */
export const splitList = (value?: string) => (value ? value.split(',').filter(Boolean) : []);
export const joinList = (items: string[]) => (items.length ? items.join(',') : undefined);

/** ?flag=1, ?flag=true, ?flag (TanStack parses them as true / 1 / "1" / "true"). */
export const parseFlag = (value: unknown): true | undefined =>
    value === true || value === 1 || value === '1' || value === 'true' ? true : undefined;

/** A flag that's on by default: only ?flag=0 / ?flag=false turns it off. */
export const parseOff = (value: unknown): false | undefined =>
    value === false || value === 0 || value === '0' || value === 'false' ? false : undefined;

/** A season id (0 and up), or "all" when `allowAll`. */
export function parseSeason(value: unknown, allowAll: true): SeasonScope | undefined;
export function parseSeason(value: unknown, allowAll?: false): number | undefined;
export function parseSeason(value: unknown, allowAll = false): SeasonScope | undefined {
    if (allowAll && value === 'all') return 'all';
    const season = Number(value);
    return value != null && value !== '' && Number.isInteger(season) && season >= 0
        ? season
        : undefined;
}

export const parseUserId = (value: unknown) =>
    typeof value === 'string' && USER_ID_PATTERN.test(value) ? value : undefined;

/** Trimmed text, cut at `max` characters; undefined when empty. */
export const parseText = (value: unknown, max = 40) =>
    typeof value === 'string' && value.trim() !== '' ? value.trim().slice(0, max) : undefined;

/** One of `allowed`, unless it's the default (kept out of the URL). */
export function parseOption<T extends string | number>(
    value: unknown,
    allowed: readonly T[],
    fallback?: T,
): T | undefined {
    return allowed.includes(value as T) && value !== fallback ? (value as T) : undefined;
}
