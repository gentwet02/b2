import Page from '@/components/page/Page';
import PageHeader from '@/components/page/PageHeader';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import Prompt from '@/components/text/Prompt';
import StatsControls from '@/features/stats/StatsControls';
import StatsOverview from '@/features/stats/StatsOverview';
import StatsPicks from '@/features/stats/StatsPicks';
import StatsPlayers from '@/features/stats/StatsPlayers';
import useStatsPage from './useStatsPage';

export default function Stats() {
    const page = useStatsPage();

    return (
        <Page className='stats'>
            <PageHeader
                title='Stats'
                subtitle='How heroes, towers, strats and maps do, and who beats whom: for a group, a clan or one player, against another.'
            />

            <StatsControls
                search={page.search}
                seasonQuery={page.seasonQuery}
                a={page.a}
                b={page.b}
                names={page.names}
                towers={page.towers}
                focus
                data={page.stats.data}
                onChange={page.update}
                onModeA={page.onModeA}
                onModeB={page.onModeB}
                onSwap={page.swap}
                onAdd={page.addToList}
                onLeaveOut={page.leaveOut}
            />

            {page.waiting ? (
                page.seasonKnown ? (
                    <Prompt>Pick a {page.missing ?? 'player'} above to see the stats.</Prompt>
                ) : page.seasons.error ? (
                    <ErrorState
                        title="Couldn't load the seasons"
                        error={page.seasons.error}
                        onRetry={() => page.seasons.refetch()}
                    />
                ) : (
                    <Loading label='Loading the seasons…' />
                )
            ) : (
                <>
                    <StatsOverview
                        comparison={page.comparison}
                        updating={page.cmpUpdating}
                        mirrored={!page.loadoutFiltered}
                    />
                    {page.picksView ? (
                        <StatsPicks
                            stats={page.stats}
                            viewState={page.viewState}
                            focused={page.focused}
                            onChange={page.update}
                        />
                    ) : (
                        <StatsPlayers
                            data={page.comparison.data}
                            params={page.compareParams}
                            search={page.search}
                            viewState={page.viewState}
                            sameRange={page.sameRange}
                            updating={page.cmpUpdating}
                            onChange={page.update}
                            onDrill={page.drill}
                        />
                    )}
                </>
            )}
        </Page>
    );
}
