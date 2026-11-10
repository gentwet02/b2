import { useMemo, useState } from 'react';
import { getRouteApi } from '@tanstack/react-router';
import { MATCH_SORT_DEFAULT } from '@/config/match';
import { STATS_MIN_DEFAULT, STATS_MIN_PICK_DEFAULT } from '@/config/stats';
import useComparison from '@/hooks/queries/useComparison';
import useSeasons from '@/hooks/queries/useSeasons';
import useSideOpponents from '@/hooks/queries/useSideOpponents';
import useStats from '@/hooks/queries/useStats';
import type { ClanSideInfo } from '@/types/clan';
import type { CompareSideKey } from '@/types/compare';
import type { SideMode, StatsSearch, StatsViewState } from '@/types/stats';
import { playerLabel } from '@/utils/player';
import {
    compareParamsOf,
    drilledSearch,
    focusedTowers,
    isFocused,
    isLoadoutFiltered,
    sideMissing,
    statsParamsOf,
    statsSeasonQuery,
    statsSides,
    statsTabs,
    swappedSearch,
    type Picking,
} from '@/utils/statsSearch';

const routeApi = getRouteApi('/stats');

interface NamedPlayer {
    userId: string | null;
    name?: string | null;
    alias?: string | null;
    clan?: ClanSideInfo | null | undefined;
}

/**
 * Everything the stats page shows, read from its URL: the sides, the tabs, both answers
 * (/stats for the picks tables, /compare for the record and the players tabs), and the
 * changes the controls make. The page only lays it out.
 */
export default function useStatsPage() {
    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    // "One player" or "Clan" picked on a side, the player or clan not yet (not in the URL)
    const [picking, setPicking] = useState<Picking>({ a: false, b: false });

    const seasons = useSeasons();
    const liveSeason = seasons.data?.liveSeason;
    const { from, seasonQuery } = statsSeasonQuery(search, liveSeason);
    // who side 1 met, once it is one player or one clan: what side 2 is picked from
    const picked = useMemo(
        () =>
            search.player ? { player: search.player } : search.clan ? { clan: search.clan } : null,
        [search.player, search.clan],
    );
    const met = useSideOpponents(picked, seasonQuery);

    const { a, b } = statsSides(search, picking);
    const missing = sideMissing(a) ?? sideMissing(b);
    const waiting =
        !!missing ||
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
        // a side's player or clan taken away, nothing put in its place: back to its range
        if (('player' in next || 'clan' in next) && !next.player && !next.clan) {
            setPicking((p) => ({ ...p, a: false }));
        }
        if (('player2' in next || 'clan2' in next) && !next.player2 && !next.clan2) {
            setPicking((p) => ({ ...p, b: false }));
        }
        void navigate({
            search: (prev) => ({ ...prev, ...next }),
            replace: true,
            resetScroll: false,
        });
    }

    function onModeA(mode: SideMode) {
        if (mode === a.mode) return;
        // picking set after update, which resets it
        update({ player: undefined, clan: undefined });
        if (mode !== 'top') setPicking((p) => ({ ...p, a: mode }));
    }

    function onModeB(mode: SideMode) {
        if (mode === b.mode) return;
        // side 1 picked: the player or the clan it met most, right away
        const first =
            mode === 'player' ? met.data?.opponents[0]?.userId : met.data?.clans[0]?.id;
        if (mode !== 'top' && first) {
            update(
                mode === 'player'
                    ? { player2: first, clan2: undefined }
                    : { player2: undefined, clan2: first },
            );
            return;
        }
        update({ player2: undefined, clan2: undefined });
        if (mode !== 'top') setPicking((p) => ({ ...p, b: mode }));
    }

    function swap() {
        // after update, which resets what a side without a player or a clan is picking
        update(swappedSearch(search, a, b));
        setPicking({ a: picking.b, b: picking.a });
    }

    const drill = (side: CompareSideKey, userId: string) => update(drilledSearch(side, userId));

    // names of the players and clans picked, by id, for the pickers when they aren't in
    // their lists
    const names = useMemo(() => {
        const out: Record<string, string> = {};
        function add(p: NamedPlayer | null | undefined) {
            if (p?.userId && (p.name || p.alias)) out[p.userId] = playerLabel(p);
            if (p?.clan?.name) out[p.clan.id] = p.clan.name;
        }
        add(stats.data?.player);
        add(stats.data && { userId: null, clan: stats.data.clan });
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
        /** a side's player or clan isn't picked yet, or the season isn't known */
        waiting,
        /** what a side still needs: its player or its clan */
        missing,
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
