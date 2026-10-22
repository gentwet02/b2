import { getRouteApi, Link } from '@tanstack/react-router';
import { useState } from 'react';
import Page from '@/components/page/Page';
import PageHeader from '@/components/page/PageHeader';
import Panel from '@/components/panel/Panel';
import Results from '@/components/results/Results';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import Prompt from '@/components/text/Prompt';
import { validExclude } from '@/config/ranges';
import {
    STATS_MAX_TOWERS,
    STATS_MIN_DEFAULT,
    STATS_MIN_PICK_DEFAULT,
    STATS_PLAYERS_DEFAULT,
    STATS_SPLIT_VARIANTS_DEFAULT,
    STATS_VIEW_DEFAULT,
} from '@/config/stats';
import StatsControls from '@/features/stats/StatsControls';
import StatsResults from '@/features/stats/StatsResults';
import StatsSummary from '@/features/stats/StatsSummary';
import StatsViewOptions from '@/features/stats/StatsViewOptions';
import useStats from '@/hooks/queries/useStats';
import type { StatsSearch } from '@/types/stats';
import { gamesOf } from '@/utils/record';
import { splitList } from '@/utils/search';

const routeApi = getRouteApi('/stats');

export default function Stats() {
    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    const [pickingPlayer, setPickingPlayer] = useState(false);

    const playerMode = !!search.player || pickingPlayer;
    const players = search.players ?? STATS_PLAYERS_DEFAULT;
    const towers = splitList(search.towers).slice(0, STATS_MAX_TOWERS);
    const view = search.view ?? STATS_VIEW_DEFAULT;
    const min = search.min ?? STATS_MIN_DEFAULT;
    const minPick = search.pick ?? STATS_MIN_PICK_DEFAULT;
    const split = search.variants ?? STATS_SPLIT_VARIANTS_DEFAULT;
    const towersOnly = !!search.towersOnly;

    const { data, isLoading, error, refetch, isPlaceholderData } = useStats(
        {
            season: search.season,
            player: search.player,
            players,
            exclude: search.exclude,
            map: search.map,
            hero: search.hero,
            towers,
        },
        !playerMode || !!search.player,
    );

    // every change goes through here: defaults are kept out of the URL
    const update = (next: Partial<StatsSearch>) => {
        if ('player' in next && !next.player) setPickingPlayer(false);
        void navigate({
            search: (prev) => {
                const merged = { ...prev, ...next };
                const custom =
                    !merged.player && merged.players && merged.players !== STATS_PLAYERS_DEFAULT;
                return {
                    season: merged.season,
                    player: merged.player,
                    players: !merged.player && custom ? merged.players : undefined,
                    // dropped when the range no longer contains it
                    exclude: merged.player
                        ? undefined
                        : validExclude(merged.players ?? STATS_PLAYERS_DEFAULT, merged.exclude),
                    map: merged.map,
                    hero: merged.hero,
                    towers: merged.towers || undefined,
                    view:
                        merged.view && merged.view !== STATS_VIEW_DEFAULT ? merged.view : undefined,
                    min: merged.min && merged.min !== STATS_MIN_DEFAULT ? merged.min : undefined,
                    pick:
                        merged.pick && merged.pick !== STATS_MIN_PICK_DEFAULT
                            ? merged.pick
                            : undefined,
                    variants: merged.variants === false ? false : undefined,
                    towersOnly: merged.towersOnly || undefined,
                };
            },
            replace: true,
            resetScroll: false,
        });
    };

    return (
        <Page className='stats'>
            <PageHeader
                title='Stats'
                subtitle='How often heroes, towers and strats are picked, and how they do.'
            />

            <StatsControls
                search={search}
                playerMode={playerMode}
                players={players}
                towers={towers}
                data={data}
                onChange={update}
                onPlayerMode={() => setPickingPlayer(true)}
            />

            {playerMode && !search.player ? (
                <Prompt>Pick a player above to see their stats.</Prompt>
            ) : isLoading ? (
                <Loading label='Counting the games…' />
            ) : error || !data ? (
                <ErrorState error={error} onRetry={() => refetch()} />
            ) : (
                <Results updating={isPlaceholderData}>
                    <StatsSummary data={data} />
                    {gamesOf(data.selection) > 0 || data.maps.length > 0 ? (
                        <Panel
                            headClassName='stats-results__head'
                            actions={
                                <StatsViewOptions
                                    view={view}
                                    split={split}
                                    towersOnly={towersOnly}
                                    min={min}
                                    minPick={minPick}
                                    onChange={update}
                                />
                            }
                        >
                            <StatsResults
                                data={data}
                                view={view}
                                min={min}
                                minPick={minPick}
                                split={split}
                                towersOnly={towersOnly}
                                onFocus={update}
                            />
                        </Panel>
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
                </Results>
            )}
        </Page>
    );
}
