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

/** A value matching `pattern` once trimmed, cut at `max` characters. */
const matching = (value: unknown, pattern: RegExp, max: number) =>
    typeof value === 'string' && pattern.test(value.trim()) ? value.trim().slice(0, max) : undefined;

/**
 * The loadout and map filters, read the same way by every page that has them (stats, matches).
 * Lists are comma separated, as joinList writes them.
 */

/** "Druid,Alchemist": tower ids. */
export const parseTowerList = (value: unknown, max: number) =>
    matching(value, /^[A-Za-z0-9_,]+$/, max);

/** "Quincy,Adora:Adora_Fateweaver": heroes, any variant ("Quincy") or one ("base:variant"). */
export const parseHeroList = (value: unknown, max: number) =>
    matching(value, /^[A-Za-z0-9_:,]+$/, max);

/** "oasis,dino:reversed": map keys, maybe one version. */
export const parseMapList = (value: unknown, max: number) => matching(value, /^[a-z0-9:,]+$/, max);

/** One hero: "Quincy" (any variant) or "Quincy:Quincy_Cyber". */
export const parseHeroPick = (value: unknown) =>
    matching(value, /^[A-Za-z0-9_]+(:[A-Za-z0-9_]+)?$/, 82);

/** One map: "oasis" (both versions), "oasis:classic" or "oasis:reversed". */
export const parseMapKey = (value: unknown) =>
    matching(value, /^[a-z0-9]+(:(classic|reversed))?$/, 60);

/** Longest exclusion list kept in the URL. */
const EXCLUDED_MAX = 300;

/** The exclusions: heroes, towers and maps left out (the "2" ones: the other side's). */
export function parseExclusions(search: Record<string, unknown>) {
    return {
        exHeroes: parseHeroList(search.exHeroes, EXCLUDED_MAX),
        exTowers: parseTowerList(search.exTowers, EXCLUDED_MAX),
        exMaps: parseMapList(search.exMaps, EXCLUDED_MAX),
        exHeroes2: parseHeroList(search.exHeroes2, EXCLUDED_MAX),
        exTowers2: parseTowerList(search.exTowers2, EXCLUDED_MAX),
    };
}

/**
 * A route's search middleware: what any navigation or link puts in the URL goes through the
 * route's own reader, so defaults, invalid values and old params (?band, ?variants) are dropped.
 * The reader is then the one place a page's URL rules live, both ways.
 */
export function onlyParsed<T extends object>(parse: (search: Record<string, unknown>) => T) {
    return ({ search, next }: { search: T; next: (search: T) => T }): T =>
        parse(next(search) as Record<string, unknown>);
}
