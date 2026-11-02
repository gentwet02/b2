import { useMemo, useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { MATCH_SORT_DEFAULT } from '@/config/match';
import { STATS_MIN_DEFAULT, STATS_MIN_PICK_DEFAULT } from '@/config/stats';
import useComparison from '@/hooks/queries/useComparison';
import useOpponentsMet from '@/hooks/queries/useOpponentsMet';
import useSeasons from '@/hooks/queries/useSeasons';
import useStats from '@/hooks/queries/useStats';
import type { CompareSideKey } from '@/types/compare';
import type { SideMode, StatsSearch, StatsViewState } from '@/types/stats';
import { playerLabel } from '@/utils/player';
import {
    compareParamsOf,
    drilledSearch,
    focusedTowers,
    isFocused,
    isLoadoutFiltered,
    statsParamsOf,
    statsSeasonQuery,
    statsSides,
    statsTabs,
    swappedSearch,
    type Picking,
} from '@/utils/statsSearch';

const routeApi = getRouteApi('/stats');

type NamedPlayer = { userId: string | null; name?: string | null; alias?: string | null };

/**
 * Everything the stats page shows, read from its URL: the sides, the tabs, both answers
 * (/stats for the picks tables, /compare for the record and the players tabs), and the
 * changes the controls make. The page only lays it out.
 */
export default function useStatsPage() {
    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    // "One player" picked on a side, the player not yet (not in the URL)
    const [picking, setPicking] = useState<Picking>({ a: false, b: false });

    const seasons = useSeasons();
    const liveSeason = seasons.data?.liveSeason;
    const { from, seasonQuery } = statsSeasonQuery(search, liveSeason);
    const met = useOpponentsMet(search.player ?? '', seasonQuery);

    const { a, b } = statsSides(search, picking);
    const waiting =
        (a.mode === 'player' && !a.player) ||
        (b.mode === 'player' && !b.player) ||
        // a range from the live season: wait to know which one it is
        (search.seasonTo !== undefined && from === undefined);

    const { tabs, view, picksView, sameRange } = statsTabs(a, b, search);
    const viewState: StatsViewState = {
        tabs,
        view,
        min: search.min ?? STATS_MIN_DEFAULT,
        minPick: search.pick ?? STATS_MIN_PICK_DEFAULT,
        towersOnly: !!search.towersOnly,
        sort: search.sort ?? MATCH_SORT_DEFAULT,
    };

    // on the players tabs too: its options feed the map, hero and tower pickers
    const stats = useStats(statsParamsOf(search, a, b, seasonQuery), !waiting);
    const compareParams = compareParamsOf(search, a, b, seasonQuery);
    const comparison = useComparison(compareParams, !waiting);

    /** Every change: the route's search rules (utils/statsSearch) tidy the URL. */
    function update(next: Partial<StatsSearch>) {
        if ('player' in next && !next.player) setPicking((p) => ({ ...p, a: false }));
        if ('player2' in next && !next.player2) setPicking((p) => ({ ...p, b: false }));
        void navigate({
            search: (prev) => ({ ...prev, ...next }),
            replace: true,
            resetScroll: false,
        });
    }

    function onModeA(mode: SideMode) {
        if (mode === 'top') update({ player: undefined });
        else setPicking((p) => ({ ...p, a: true }));
    }

    function onModeB(mode: SideMode) {
        if (mode === 'top') {
            update({ player2: undefined });
            return;
        }
        // one player against one player: the opponent they met most, right away
        const first = search.player ? met.data?.[0]?.userId : undefined;
        if (first) update({ player2: first });
        else setPicking((p) => ({ ...p, b: true }));
    }

    function swap() {
        setPicking({ a: picking.b, b: picking.a });
        update(swappedSearch(search, a, b));
    }

    const drill = (side: CompareSideKey, userId: string) => update(drilledSearch(side, userId));

    // names of the players picked, for the pickers when they aren't in their lists
    const names = useMemo(() => {
        const out: Record<string, string> = {};
        function add(p: NamedPlayer | null | undefined) {
            if (p?.userId && (p.name || p.alias)) out[p.userId] = playerLabel(p);
        }
        add(stats.data?.player);
        add(stats.data?.against);
        add(comparison.data?.a);
        add(comparison.data?.b);
        return out;
    }, [stats.data, comparison.data]);

    // switching sides: the other answer stays on screen until the new one comes
    const cmp = comparison.data;
    const cmpFits = !!cmp && cmp.a.mode === a.mode && cmp.b.mode === b.mode;

    return {
        search,
        seasonQuery,
        /** the first season counted is known (the live one comes from /info) */
        seasonKnown: from !== undefined,
        /** the season list (/info), for its error */
        seasons,
        a,
        b,
        /** a side's player isn't picked yet, or the season isn't known */
        waiting,
        viewState,
        picksView,
        sameRange,
        towers: focusedTowers(search),
        focused: isFocused(search),
        loadoutFiltered: isLoadoutFiltered(search),
        stats,
        comparison,
        compareParams,
        cmpUpdating: comparison.isPlaceholderData || !cmpFits,
        names,
        update,
        onModeA,
        onModeB,
        swap,
        drill,
    };
}
