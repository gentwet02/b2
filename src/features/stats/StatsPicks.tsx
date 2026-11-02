import { Link } from '@tanstack/react-router';
import Panel from '@/components/panel/Panel';
import Results from '@/components/results/Results';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import Prompt from '@/components/text/Prompt';
import type useStats from '@/hooks/queries/useStats';
import type { StatsSearch, StatsViewState } from '@/types/stats';
import { gamesOf } from '@/utils/record';
import StatsResults from './StatsResults';
import StatsSummary from './StatsSummary';
import StatsViewOptions from './StatsViewOptions';

interface StatsPicksProps {
    /** the /stats answer for the sides and filters */
    stats: ReturnType<typeof useStats>;
    viewState: StatsViewState;
    /** a map, hero or towers focused: their summary first */
    focused: boolean;
    onChange: (next: Partial<StatsSearch>) => void;
}

/** The heroes, towers, strats and maps tabs: a picks table, from /stats. */
export default function StatsPicks(props: StatsPicksProps) {
    const { stats, viewState, focused, onChange } = props;
    const { data, isLoading, error, refetch, isPlaceholderData } = stats;

    if (isLoading) return <Loading label='Counting the games…' />;
    if (error || !data) return <ErrorState error={error} onRetry={() => refetch()} />;
    return (
        <Results updating={isPlaceholderData}>
            {focused && <StatsSummary data={data} />}
            <Panel
                headClassName='stats-results__head'
                actions={<StatsViewOptions {...viewState} onChange={onChange} />}
            >
                {gamesOf(data.selection) > 0 || data.maps.length > 0 ? (
                    <StatsResults
                        data={data}
                        view={viewState.view}
                        min={viewState.min}
                        minPick={viewState.minPick}
                        towersOnly={viewState.towersOnly}
                        onFocus={onChange}
                    />
                ) : (
                    <Prompt>
                        No recorded game matches these filters.
                        {data.mode === 'player' && data.player && (
                            <>
                                {' '}
                                <Link to='/user/$userId' params={{ userId: data.player.userId }}>
                                    Open the profile
                                </Link>
                            </>
                        )}
                    </Prompt>
                )}
            </Panel>
        </Results>
    );
}
