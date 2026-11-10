import { useMemo } from 'react';
import { COMPARE_SLOTS } from '@/config/compare';
import useRankedPlayers from '@/hooks/queries/useRankedPlayers';
import useSeasons from '@/hooks/queries/useSeasons';
import useCompareSlots, { resetCompareSlots, setCompareSlot } from '@/hooks/useCompareSlots';
import type { OpponentSlot } from '@/types/compare';
import type { SeasonScope } from '@/types/season';
import { fillSlots } from '@/utils/slots';

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
        const ranked = board.players.map((p) => p.id);
        return fillSlots(ranked, overrides, userId, COMPARE_SLOTS);
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
