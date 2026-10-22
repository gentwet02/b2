import MatchList from '@/components/match/MatchList';
import Panel from '@/components/panel/Panel';
import { COMPARE_MAX_MATCHES } from '@/config/compare';
import type { Versus } from '@/types/compare';

interface VersusMatchesProps {
    data: Versus;
}

/** Player mode: the latest games between the two. */
export default function VersusMatches(props: VersusMatchesProps) {
    const { data } = props;

    if (!data.matches?.length) return null;

    return (
        <Panel
            className='panel--matches'
            title='Their games'
            note={
                data.matches.length === COMPARE_MAX_MATCHES
                    ? `The latest ${COMPARE_MAX_MATCHES}`
                    : 'Newest first'
            }
        >
            <MatchList matches={data.matches} perspectiveId={data.userId} />
        </Panel>
    );
}
