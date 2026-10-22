import Panel from '@/components/panel/Panel';
import type { Versus } from '@/types/compare';
import { playerLabel } from '@/utils/player';
import LoadoutTable from './LoadoutTable';

interface VersusLoadoutsProps {
    data: Versus;
    name: string;
}

/** Side by side: the profile player's loadouts, and the opponents'. */
export default function VersusLoadouts(props: VersusLoadoutsProps) {
    const { data, name } = props;

    const opponent = data.mode === 'player' ? data.opponents[0] : undefined;

    return (
        <div className='versus-pair'>
            <Panel title={`${name}’s loadouts`} note='Record with each'>
                <LoadoutTable rows={data.total.mine} labels={data.labels} />
            </Panel>
            <Panel
                title={opponent ? `${playerLabel(opponent)}’s loadouts` : 'Their loadouts'}
                note={`${name}’s record against each`}
            >
                <LoadoutTable rows={data.total.theirs} labels={data.labels} />
            </Panel>
        </div>
    );
}
