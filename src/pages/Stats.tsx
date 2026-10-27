import { getRouteApi, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import Page from '@/components/page/Page';
import PageHeader from '@/components/page/PageHeader';
import Panel from '@/components/panel/Panel';
import Results from '@/components/results/Results';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import Prompt from '@/components/text/Prompt';
import { validExclude } from '@/config/ranges';
import {
    STATS_AGAINST_DEFAULT,
    STATS_MAX_TOWERS,
    STATS_MIN_DEFAULT,
    STATS_MIN_PICK_DEFAULT,
    STATS_PLAYERS_DEFAULT,
    STATS_VIEW_DEFAULT,
    STATS_VIEWS,
} from '@/config/stats';
import CompareMembers from '@/features/compare/CompareMembers';
import VersusMatches from '@/features/compare/VersusMatches';
import VersusSeasons from '@/features/compare/VersusSeasons';
import VersusSummary from '@/features/compare/VersusSummary';
import StatsControls from '@/features/stats/StatsControls';
import StatsResults from '@/features/stats/StatsResults';
import type { SideState } from '@/features/stats/StatsSides';
import StatsSummary from '@/features/stats/StatsSummary';
import StatsViewOptions from '@/features/stats/StatsViewOptions';
import useComparison from '@/hooks/queries/useComparison';
import type { CompareParams } from '@/services/api/compare';
import { MATCH_SORT_DEFAULT } from '@/config/match';
import useOpponentsMet from '@/hooks/queries/useOpponentsMet';
import useSeasons from '@/hooks/queries/useSeasons';
import useStats from '@/hooks/queries/useStats';
import type { CompareSideKey } from '@/types/compare';
import type { SeasonQuery } from '@/types/season';
import type { SideMode, StatsSearch, StatsView } from '@/types/stats';
import { focusParts, groupName, sideName, sidePossessive } from '@/utils/compareTitles';
import { playerLabel } from '@/utils/player';
import { gamesOf } from '@/utils/record';
import { splitList } from '@/utils/search';

const routeApi = getRouteApi('/stats');

export default function Stats() {
    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    // "One player" picked on a side, the player not yet
    const [picking, setPicking] = useState({ a: false, b: false });
    const liveSeason = useSeasons().data?.liveSeason;
    // a range of seasons: "40-47" for the server
    const from = search.season ?? liveSeason;
    const seasonQuery: SeasonQuery | undefined =
        typeof from === 'number' && search.seasonTo !== undefined && search.seasonTo !== from
            ? `${Math.min(from, search.seasonTo)}-${Math.max(from, search.seasonTo)}`
            : search.season;
    const overlap = search.overlap !== false;
    const met = useOpponentsMet(search.player ?? '', seasonQuery);

    const a: SideState = {
        mode: search.player || picking.a ? 'player' : 'top',
        player: search.player,
        range: search.players ?? STATS_PLAYERS_DEFAULT,
        exclude: search.exclude,
    };
    const b: SideState = {
        mode: search.player2 || picking.b ? 'player' : 'top',
        player: search.player2,
        range: search.players2 ?? STATS_AGAINST_DEFAULT,
        exclude: search.exclude2,
    };
    const waiting =
        (a.mode === 'player' && !a.player) ||
        (b.mode === 'player' && !b.player) ||
        // a range from the live season: wait to know which one it is
        (search.seasonTo !== undefined && from === undefined);

    const towers = splitList(search.towers).slice(0, STATS_MAX_TOWERS);
    // each side's loadout filtered on its own
    const split = !!search.sides;
    // the tabs: the picks tables, then the players ones that fit the sides
    const rangeTab = (range: string, exclude: string | undefined) => {
        const name = groupName({ mode: 'top', userId: null, name: null, alias: null, range, exclude: exclude ?? null });
        return /players$/i.test(name) ? name : `${name} players`;
    };
    // a hero or tower filter on a side makes the two sides' tables differ
    const loadoutFiltered =
        !!search.hero ||
        !!search.towers ||
        !!search.exHeroes ||
        !!search.exTowers ||
        (!!search.sides &&
            (!!search.hero2 || !!search.towers2 || !!search.exHeroes2 || !!search.exTowers2));
    const sameRange =
        a.mode === 'top' &&
        b.mode === 'top' &&
        a.range === b.range &&
        (a.exclude ?? '') === (b.exclude ?? '') &&
        !loadoutFiltered;
    const tabA = rangeTab(a.range, a.exclude);
    const tabB = rangeTab(b.range, b.exclude);
    // the same name on both tabs (a loadout filter tells them apart): name the boxes too
    const twin = a.mode === 'top' && b.mode === 'top' && tabA === tabB;
    const tabs: { value: StatsView; label: string }[] = [
        ...STATS_VIEWS,
        ...(a.mode === 'top'
            ? [{ value: 'players' as const, label: twin && !sameRange ? `Players: ${tabA}` : tabA }]
            : []),
        // the same range on both sides: one table is enough
        ...(b.mode === 'top' && !sameRange
            ? [{ value: 'opponents' as const, label: twin ? `Against: ${tabB}` : tabB }]
            : []),
        ...(a.mode === 'player' || b.mode === 'player' ? [{ value: 'games' as const, label: 'Games' }] : []),
    ];
    // a link to the opponents' table lands on the one table there is
    const asked =
        sameRange && search.view === 'opponents' ? 'players' : (search.view ?? STATS_VIEW_DEFAULT);
    const view = tabs.some((t) => t.value === asked) ? asked : STATS_VIEW_DEFAULT;
    const picksView = STATS_VIEWS.some((t) => t.value === view);
    const min = search.min ?? STATS_MIN_DEFAULT;
    const minPick = search.pick ?? STATS_MIN_PICK_DEFAULT;
    const towersOnly = !!search.towersOnly;

    const sides = {
        season: seasonQuery,
        overlap,
        player: search.player,
        players: a.range,
        exclude: search.exclude,
        player2: search.player2,
        players2: b.range,
        exclude2: search.exclude2,
    };
    const stats = useStats(
        {
            ...sides,
            map: search.map,
            hero: search.hero,
            towers,
            exHeroes: search.exHeroes,
            exTowers: search.exTowers,
            exMaps: search.exMaps,
            ...(split && {
                sides: true,
                hero2: search.hero2,
                towers2: splitList(search.towers2).slice(0, STATS_MAX_TOWERS),
                exHeroes2: search.exHeroes2,
                exTowers2: search.exTowers2,
            }),
        },
        // on the players tabs too: its options feed the map, hero and tower pickers
        !waiting,
    );
    const compareParams: CompareParams = {
        season: seasonQuery,
        overlap,
        a: a.player ? { player: a.player } : { range: a.range, exclude: a.exclude },
        b: b.player ? { player: b.player } : { range: b.range, exclude: b.exclude },
        filters: {
            map: search.map,
            exMaps: search.exMaps,
            hero: search.hero,
            towers: search.towers,
            exHeroes: search.exHeroes,
            exTowers: search.exTowers,
            ...(split && {
                hero2: search.hero2,
                towers2: search.towers2,
                exHeroes2: search.exHeroes2,
                exTowers2: search.exTowers2,
            }),
        },
    };
    const comparison = useComparison(compareParams, !waiting);

    // every change goes through here: defaults are kept out of the URL
    const update = (next: Partial<StatsSearch>) => {
        if ('player' in next && !next.player) setPicking((p) => ({ ...p, a: false }));
        if ('player2' in next && !next.player2) setPicking((p) => ({ ...p, b: false }));
        void navigate({
            search: (prev) => {
                const merged = { ...prev, ...next };
                const custom =
                    !merged.player && merged.players && merged.players !== STATS_PLAYERS_DEFAULT;
                const player2 = merged.player2 === merged.player ? undefined : merged.player2;
                const range2 = merged.players2 ?? STATS_AGAINST_DEFAULT;
                return {
                    season: merged.season,
                    seasonTo: merged.season === 'all' ? undefined : merged.seasonTo,
                    overlap: merged.overlap === false ? false : undefined,
                    player: merged.player,
                    players: !merged.player && custom ? merged.players : undefined,
                    // dropped when the range no longer contains it
                    exclude: merged.player
                        ? undefined
                        : validExclude(merged.players ?? STATS_PLAYERS_DEFAULT, merged.exclude),
                    player2,
                    players2: player2 || range2 === STATS_AGAINST_DEFAULT ? undefined : range2,
                    exclude2: player2 ? undefined : validExclude(range2, merged.exclude2),
                    map: merged.map,
                    hero: merged.hero,
                    towers: merged.towers || undefined,
                    exHeroes: merged.exHeroes || undefined,
                    exTowers: merged.exTowers || undefined,
                    exMaps: merged.exMaps || undefined,
                    sides: merged.sides || undefined,
                    hero2: (merged.sides && merged.hero2) || undefined,
                    towers2: (merged.sides && merged.towers2) || undefined,
                    exHeroes2: (merged.sides && merged.exHeroes2) || undefined,
                    exTowers2: (merged.sides && merged.exTowers2) || undefined,
                    view:
                        merged.view && merged.view !== STATS_VIEW_DEFAULT ? merged.view : undefined,
                    min: merged.min && merged.min !== STATS_MIN_DEFAULT ? merged.min : undefined,
                    pick:
                        merged.pick && merged.pick !== STATS_MIN_PICK_DEFAULT
                            ? merged.pick
                            : undefined,
                    splitMaps: merged.splitMaps,
                    splitHeroes: merged.splitHeroes,
                    towersOnly: merged.towersOnly || undefined,
                    sort: merged.sort,
                };
            },
            replace: true,
            resetScroll: false,
        });
    };

    const onModeA = (mode: SideMode) => {
        if (mode === 'top') update({ player: undefined });
        else setPicking((p) => ({ ...p, a: true }));
    };

    const onModeB = (mode: SideMode) => {
        if (mode === 'top') {
            update({ player2: undefined });
        } else {
            // one player against one player: the opponent they met most, right away
            const first = search.player ? met.data?.[0]?.userId : undefined;
            if (first) update({ player2: first });
            else setPicking((p) => ({ ...p, b: true }));
        }
    };

    const swap = () => {
        setPicking({ a: picking.b, b: picking.a });
        update({
            player: search.player2,
            players: b.range,
            exclude: search.exclude2,
            player2: search.player,
            players2: a.range,
            exclude2: search.exclude,
            // each side keeps its own loadout filter
            ...(split && {
                hero: search.hero2,
                towers: search.towers2,
                exHeroes: search.exHeroes2,
                exTowers: search.exTowers2,
                hero2: search.hero,
                towers2: search.towers,
                exHeroes2: search.exHeroes,
                exTowers2: search.exTowers,
            }),
        });
    };

    // the player alone takes the place of their side
    const drill = (side: CompareSideKey, userId: string) =>
        update(
            side === 'a'
                ? { player: userId, players: undefined, exclude: undefined }
                : { player2: userId, players2: undefined, exclude2: undefined },
        );

    // names of the players picked, for the pickers when they aren't in their lists
    const names = useMemo(() => {
        const out: Record<string, string> = {};
        const add = (p: { userId: string | null; name?: string | null; alias?: string | null } | null | undefined) => {
            if (p?.userId && (p.name || p.alias)) out[p.userId] = playerLabel(p);
        };
        add(stats.data?.player);
        add(stats.data?.against);
        add(comparison.data?.a);
        add(comparison.data?.b);
        return out;
    }, [stats.data, comparison.data]);

    const viewOptions = (
        <StatsViewOptions
            tabs={tabs}
            view={view}
            towersOnly={towersOnly}
            min={min}
            minPick={minPick}
            sort={search.sort ?? MATCH_SORT_DEFAULT}
            onChange={update}
        />
    );

    const focused =
        !!search.map ||
        !!search.hero ||
        towers.length > 0 ||
        !!search.hero2 ||
        !!search.towers2;

    /** The picks table of the tab, from /stats. */
    const picksResults = () => {
        const { data, isLoading, error, refetch, isPlaceholderData } = stats;
        if (isLoading) return <Loading label='Counting the games…' />;
        if (error || !data) return <ErrorState error={error} onRetry={() => refetch()} />;
        return (
            <Results updating={isPlaceholderData}>
                {focused && <StatsSummary data={data} />}
                <Panel headClassName='stats-results__head' actions={viewOptions}>
                    {gamesOf(data.selection) > 0 || data.maps.length > 0 ? (
                        <StatsResults
                            data={data}
                            view={view}
                            min={min}
                            minPick={minPick}
                            towersOnly={towersOnly}
                            onFocus={update}
                        />
                    ) : (
                        <Prompt>
                            No recorded game matches these filters.
                            {data.mode === 'player' && data.player && (
                                <>
                                    {' '}
                                    <Link
                                        to='/user/$userId'
                                        params={{ userId: data.player.userId }}
                                    >
                                        Open the profile
                                    </Link>
                                </>
                            )}
                        </Prompt>
                    )}
                </Panel>
            </Results>
        );
    };

    // switching sides: the other answer stays on screen until the new one comes
    const cmp = comparison.data;
    const cmpFits = !!cmp && cmp.a.mode === a.mode && cmp.b.mode === b.mode;
    const cmpUpdating = comparison.isPlaceholderData || !cmpFits;

    /** The overview: the record between the sides and their best and worst picks. */
    const overview = () => {
        if (comparison.isLoading) return <Loading label='Looking up the games…' />;
        if (comparison.error || !cmp) {
            return <ErrorState error={comparison.error} onRetry={() => comparison.refetch()} />;
        }
        return (
            <Results updating={cmpUpdating}>
                <VersusSummary data={cmp} mirrored={!loadoutFiltered} />
                <VersusSeasons data={cmp} />
            </Results>
        );
    };

    /** The players tabs, from /compare: whose records, against whom, and what the filters keep. */
    const playersResults = () => {
        if (!cmp) return null;
        const focus = focusParts(cmp, search);
        const note = (text: string) => [text, ...focus].join(' · ');
        return (
            <Results updating={cmpUpdating}>
                {view === 'games' ? (
                    <VersusMatches
                        data={cmp}
                        params={compareParams}
                        sort={search.sort ?? MATCH_SORT_DEFAULT}
                        tabs={viewOptions}
                        focus={focus}
                    />
                ) : (
                    <CompareMembers
                        data={cmp}
                        side={view === 'players' ? 'a' : 'b'}
                        title=''
                        tabs={viewOptions}
                        note={note(
                            view === 'opponents'
                                ? `${sidePossessive(cmp, 'a')} record against each of these players`
                                : sameRange
                                  ? `Each player’s record against the other ${sideName(cmp, 'a')}`
                                  : `Each player’s record against ${sideName(cmp, 'b')}`,
                        )}
                        min={min}
                        onDrill={drill}
                    />
                )}
            </Results>
        );
    };

    return (
        <Page className='stats'>
            <PageHeader
                title='Stats'
                subtitle='How heroes, towers, strats and maps do, and who beats whom: for a group or one player, against another group or one opponent.'
            />

            <StatsControls
                search={search}
                seasonQuery={seasonQuery}
                a={a}
                b={b}
                names={names}
                towers={towers}
                focus
                data={stats.data}
                onChange={update}
                onModeA={onModeA}
                onModeB={onModeB}
                onSwap={swap}
            />

            {waiting && from === undefined ? (
                <Loading label='Loading the seasons…' />
            ) : waiting ? (
                <Prompt>Pick a player above to see the stats.</Prompt>
            ) : (
                <>
                    {overview()}
                    {picksView ? picksResults() : playersResults()}
                </>
            )}
        </Page>
    );
}
