import { getRouteApi, Link } from '@tanstack/react-router';
import { useState } from 'react';
import Page from '@/components/page/Page';
import PageHeader from '@/components/page/PageHeader';
import Panel from '@/components/panel/Panel';
import Results from '@/components/results/Results';
import SeasonNote from '@/components/season-note/SeasonNote';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import Prompt from '@/components/text/Prompt';
import { COMPARE_RANGE_DEFAULT } from '@/config/compare';
import { validExclude } from '@/config/ranges';
import SplitVariants from '@/components/split-variants/SplitVariants';
import VersusControls from '@/features/compare/VersusControls';
import VersusLoadouts from '@/features/compare/VersusLoadouts';
import VersusMaps from '@/features/compare/VersusMaps';
import VersusMatches from '@/features/compare/VersusMatches';
import VersusOpponents from '@/features/compare/VersusOpponents';
import VersusSeasons from '@/features/compare/VersusSeasons';
import VersusSummary from '@/features/compare/VersusSummary';
import useOpponentsMet from '@/hooks/queries/useOpponentsMet';
import useVersus from '@/hooks/queries/useVersus';
import type { CompareSearch } from '@/types/compare';
import { playerLabel } from '@/utils/player';
import { gamesOf } from '@/utils/record';

const routeApi = getRouteApi('/user/$userId/compare');

export default function Compare() {
    const { userId } = routeApi.useParams();
    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    const [pickingPlayer, setPickingPlayer] = useState(false);
    const met = useOpponentsMet(userId, search.season);

    const playerMode = !!search.vs || pickingPlayer;
    const range = search.range ?? COMPARE_RANGE_DEFAULT;
    const { data, isLoading, error, refetch, isPlaceholderData } = useVersus(
        userId,
        { season: search.season, vs: search.vs, range, exclude: search.exclude },
        !playerMode || !!search.vs,
    );

    const update = (next: CompareSearch) => {
        if ('vs' in next && !next.vs) setPickingPlayer(false);
        void navigate({
            search: (prev) => {
                const merged = { ...prev, ...next };
                const customRange =
                    !merged.vs && merged.range && merged.range !== COMPARE_RANGE_DEFAULT;
                return {
                    season: merged.season,
                    vs: merged.vs,
                    splitMaps: merged.splitMaps,
                    splitHeroes: merged.splitHeroes,
                    range: customRange ? merged.range : undefined,
                    // dropped when the range no longer contains it
                    exclude: merged.vs
                        ? undefined
                        : validExclude(merged.range ?? COMPARE_RANGE_DEFAULT, merged.exclude),
                };
            },
            replace: true,
            resetScroll: false,
        });
    };

    // "One player": the most met opponent right away
    const choosePlayerMode = () => {
        const first = met.data?.[0]?.userId;
        if (first) update({ vs: first });
        else setPickingPlayer(true);
    };

    const name = data ? playerLabel(data, 'This player') : 'This player';
    // switching modes: the other mode's data stays on screen until the new one comes
    const shown = data && (!playerMode || data.mode === 'player') ? data : undefined;
    const hasGames = !!shown && gamesOf(shown.total.record) > 0;
    const vsPlayer = shown?.mode === 'player' ? shown.opponents[0] : undefined;

    return (
        <Page className='compare'>
            <PageHeader
                title={`${name}, head to head`}
                subtitle={`Only the games ${name} played against these players.`}
                actions={
                    <Link
                        to='/user/$userId'
                        params={{ userId }}
                        search={{ splitMaps: search.splitMaps, splitHeroes: search.splitHeroes }}
                        className='button button--quiet'
                    >
                        Back to profile
                    </Link>
                }
            />

            <Panel>
                <VersusControls
                    userId={userId}
                    playerMode={playerMode}
                    vs={search.vs}
                    range={range}
                    exclude={search.exclude}
                    season={search.season}
                    vsPlayer={vsPlayer}
                    onChange={update}
                    onPlayerMode={choosePlayerMode}
                />
                <SplitVariants className='compare__split' />
                <SeasonNote season={search.season} />
            </Panel>

            {playerMode && !search.vs ? (
                <Prompt>Pick a player above to see every game between them.</Prompt>
            ) : isLoading ? (
                <Loading label='Looking up the games…' />
            ) : error || !data ? (
                <ErrorState error={error} onRetry={() => refetch()} />
            ) : !shown ? (
                <Loading label='Looking up the games…' />
            ) : (
                <Results updating={isPlaceholderData}>
                    <VersusSummary data={shown} name={name} />
                    {shown.mode === 'top' && <VersusOpponents data={shown} search={search} />}
                    {hasGames && (
                        <>
                            <VersusSeasons data={shown} />
                            <VersusMaps data={shown} />
                            <VersusLoadouts data={shown} name={name} />
                            <VersusMatches data={shown} />
                        </>
                    )}
                </Results>
            )}
        </Page>
    );
}
