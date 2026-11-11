import { getFromApi, withQuery } from '@/services/api/client';
import type { Stats, StatsParams } from '@/types/stats';

/** A list in one order, or nothing: ["Druid", "Alchemist"] asks what ["Alchemist", "Druid"] does. */
const sortedList = (list: string[] | undefined) => (list?.length ? [...list].sort() : undefined);

/**
 * The params as the server reads them: only what changes the answer (a list, one player, clan or range,
 * the opponent's loadout only with `sides`, no empty filter), lists sorted. Both the request
 * and the react-query key are made from it, so two asks are cached together exactly when the
 * server answers them the same, and a new filter needs no extra key code.
 */
export function normalizeStatsParams(p: StatsParams): StatsParams {
    return {
        season: p.season,
        overlap: p.overlap === false ? false : undefined,
        ...(p.list
            ? { list: p.list }
            : p.player
              ? { player: p.player }
              : p.clan
                ? { clan: p.clan }
                : { players: p.players, exclude: p.exclude || undefined }),
        // nobody to leave out of one player
        not: (!p.list && p.player ? undefined : p.not) || undefined,
        not2: (!p.list2 && p.player2 ? undefined : p.not2) || undefined,
        ...(p.list2
            ? { list2: p.list2 }
            : p.player2
              ? { player2: p.player2 }
              : p.clan2
                ? { clan2: p.clan2 }
                : { players2: p.players2, exclude2: (p.players2 && p.exclude2) || undefined }),
        map: p.map || undefined,
        hero: p.hero || undefined,
        towers: sortedList(p.towers),
        exHeroes: p.exHeroes || undefined,
        exTowers: p.exTowers || undefined,
        exMaps: p.exMaps || undefined,
        ...(p.sides && {
            sides: true,
            hero2: p.hero2 || undefined,
            towers2: sortedList(p.towers2),
            exHeroes2: p.exHeroes2 || undefined,
            exTowers2: p.exTowers2 || undefined,
        }),
    };
}

export const statsService = {
    getStats: (params: StatsParams) => {
        const { overlap, towers, towers2, ...rest } = normalizeStatsParams(params);
        return getFromApi<Stats>(
            withQuery('stats', {
                ...rest,
                overlap: overlap === false ? 0 : undefined,
                towers: towers?.join(','),
                towers2: towers2?.join(','),
            }),
        );
    },
};
