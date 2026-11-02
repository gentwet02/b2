import Results from '@/components/results/Results';
import CompareMembers from '@/features/compare/CompareMembers';
import VersusMatches from '@/features/compare/VersusMatches';
import type { CompareParams } from '@/services/api/compare';
import type { Comparison, CompareSideKey } from '@/types/compare';
import type { StatsSearch, StatsViewState } from '@/types/stats';
import { focusParts, sideName, sidePossessive } from '@/utils/compareTitles';
import StatsViewOptions from './StatsViewOptions';

interface StatsPlayersProps {
    /** the /compare answer (none yet: nothing shown, the overview says why) */
    data: Comparison | undefined;
    /** what it was asked, for the games tab's pages */
    params: CompareParams;
    search: StatsSearch;
    viewState: StatsViewState;
    /** both sides the same range: one table, each player against the others */
    sameRange: boolean;
    /** the answer shown is for other sides: dimmed until the new one comes */
    updating: boolean;
    onChange: (next: Partial<StatsSearch>) => void;
    /** the player alone takes the place of their side */
    onDrill: (side: CompareSideKey, userId: string) => void;
}

/** The players tabs, from /compare: whose records, against whom, and what the filters keep. */
export default function StatsPlayers(props: StatsPlayersProps) {
    const { data, params, search, viewState, sameRange, updating, onChange, onDrill } = props;
    if (!data) return null;

    const { view } = viewState;
    const tabs = <StatsViewOptions {...viewState} onChange={onChange} />;
    const focus = focusParts(data, search);
    const note =
        view === 'opponents'
            ? `${sidePossessive(data, 'a')} record against each of these players`
            : sameRange
              ? `Each player’s record against the other ${sideName(data, 'a')}`
              : `Each player’s record against ${sideName(data, 'b')}`;

    return (
        <Results updating={updating}>
            {view === 'games' ? (
                <VersusMatches
                    data={data}
                    params={params}
                    sort={viewState.sort}
                    tabs={tabs}
                    focus={focus}
                />
            ) : (
                <CompareMembers
                    data={data}
                    side={view === 'players' ? 'a' : 'b'}
                    title=''
                    tabs={tabs}
                    note={[note, ...focus].join(' · ')}
                    min={viewState.min}
                    onDrill={onDrill}
                />
            )}
        </Results>
    );
}
