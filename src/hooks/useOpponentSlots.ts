import { useMemo } from 'react';
import { COMPARE_SLOTS } from '@/config/compare';
import useRankedPlayers from '@/hooks/queries/useRankedPlayers';
import useSeasons from '@/hooks/queries/useSeasons';
import useCompareSlots, { resetCompareSlots, setCompareSlot } from '@/hooks/useCompareSlots';
import type { SeasonScope } from '@/types/season';

export interface OpponentSlot {
    index: number;
    id: string;
    /** replaced by the visitor */
    custom: boolean;
}

/**
 * The 10 opponents of a profile: the season's top 10 (the profile player left out),
 * where every slot the visitor replaced shows their pick instead.
 */
export default function useOpponentSlots(userId: string, season?: SeasonScope) {
    const seasons = useSeasons();
    const liveSeason = seasons.data?.liveSeason;
    // "all seasons" uses the live leaderboard
    const boardSeason = typeof season === 'number' ? season : liveSeason;
    const board = useRankedPlayers(boardSeason, boardSeason === liveSeason);
    const overrides = useCompareSlots();

    const slots = useMemo<OpponentSlot[]>(() => {
        const ranked = board.players.map((p) => p.id).filter((id) => id !== userId);
        if (ranked.length === 0) return [];

        // picks first, so a default never duplicates one of them
        const taken = new Set<string>();
        const picks = overrides.map((id) => {
            if (!id || id === userId || taken.has(id)) return null;
            taken.add(id);
            return id;
        });
        const defaults = ranked.slice(0, COMPARE_SLOTS);
        // a slot whose player was moved elsewhere takes the next player after the top 10
        // (not one the visitor replaced)
        const spare = ranked.slice(COMPARE_SLOTS);

        const result: OpponentSlot[] = [];
        for (let index = 0; index < COMPARE_SLOTS; index++) {
            const pick = picks[index];
            if (pick) {
                result.push({ index, id: pick, custom: true });
                continue;
            }
            // this slot's top 10 player, unless a pick elsewhere already shows them
            const own = defaults[index];
            const id = own && !taken.has(own) ? own : spare.find((s) => !taken.has(s));
            if (!id) continue;
            taken.add(id);
            result.push({ index, id, custom: false });
        }
        return result;
    }, [board.players, overrides, userId]);

    return {
        slots,
        ids: slots.map((s) => s.id),
        players: board.players,
        /** slots can be built (or the leaderboard failed: let the server pick) */
        ready: slots.length > 0 || !!board.error,
        setSlot: setCompareSlot,
        reset: resetCompareSlots,
        hasCustom: slots.some((s) => s.custom),
    };
}
