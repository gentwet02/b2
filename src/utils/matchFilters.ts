import {
    MATCH_MAX_HEROES,
    MATCH_MAX_TOWERS,
    SIDE_MAX_HEROES,
    SIDE_MAX_TOWERS,
} from '@/config/match';
import type { MatchFilterOptions, MatchesQuery, MatchPick } from '@/types/match';
import { parseHero } from '@/utils/hero';
import { isReversedMap, mapBaseKey, mapFilterOf } from '@/utils/map';
import { joinList, splitList } from '@/utils/search';

/** Is any filter set (the sort aside)? */
export const isFiltering = (query: MatchesQuery) =>
    !!(
        query.player ||
        query.heroes ||
        query.towers ||
        query.map ||
        (query.sameSide && (query.player2 || query.heroes2 || query.towers2))
    );

/** Every filter off (the season and sort stay). */
export const NO_FILTERS: Partial<MatchesQuery> = {
    player: undefined,
    heroes: undefined,
    towers: undefined,
    map: undefined,
    sameSide: undefined,
    player2: undefined,
    heroes2: undefined,
    towers2: undefined,
};

/** A hero clicked on a card, as a filter item: any variant of its base. */
function heroItem(hero: string, options: MatchFilterOptions | undefined) {
    return (
        options?.heroes.find((h) => h.variants.some((v) => v.hero === hero))?.base ??
        (hero.includes('_') ? `${hero.split('_')[0]}:${hero}` : hero)
    );
}

/**
 * A hero, tower or map clicked on a match card, added to the filters.
 * Returns the query change, or null when it's already there or there's no room.
 */
export function addPick(
    query: MatchesQuery,
    { kind, value }: MatchPick,
    options: MatchFilterOptions | undefined,
): Partial<MatchesQuery> | null {
    if (kind === 'map') {
        // the exact version when the map has a reversed one, else just the map
        const base = mapBaseKey(value);
        const versions = options?.maps.find((m) => m.key === base)?.variants.length ?? 0;
        return { map: isReversedMap(value) || versions > 1 ? mapFilterOf(value) : base };
    }

    if (query.sameSide) {
        // same player mode: on the first side with room for it
        const key = kind === 'tower' ? 'towers' : 'heroes';
        const max = kind === 'tower' ? SIDE_MAX_TOWERS : SIDE_MAX_HEROES;
        const item = kind === 'tower' ? value : heroItem(value, options);
        const same = (a: string) =>
            kind === 'tower' ? a === item : parseHero(a).base === parseHero(item).base;
        for (const side of [key, `${key}2`] as const) {
            const list = splitList(query[side]);
            if (list.some(same)) return null;
            if (list.length < max) return { [side]: joinList([...list, item]) };
        }
        return null;
    }

    if (kind === 'tower') {
        const towers = splitList(query.towers);
        if (towers.includes(value) || towers.length >= (options?.maxTowers ?? MATCH_MAX_TOWERS))
            return null;
        return { towers: joinList([...towers, value]) };
    }

    const heroes = splitList(query.heroes);
    const item = heroItem(value, options);
    const base = parseHero(item).base;
    if (
        heroes.some((h) => parseHero(h).base === base) ||
        heroes.length >= (options?.maxHeroes ?? MATCH_MAX_HEROES)
    )
        return null;
    return { heroes: joinList([...heroes, item]) };
}
