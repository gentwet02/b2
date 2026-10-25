import { useMemo } from 'react';
import Panel from '@/components/panel/Panel';
import { useSplitHeroes } from '@/hooks/useSplitVariants';
import type { Versus } from '@/types/compare';
import { withVariantLabels } from '@/utils/loadout';
import { playerLabel } from '@/utils/player';
import LoadoutTable from './LoadoutTable';

interface VersusLoadoutsProps {
    data: Versus;
    name: string;
}

/** Side by side: the profile player's loadouts, and the opponents' (hero variants apart if split). */
export default function VersusLoadouts(props: VersusLoadoutsProps) {
    const { data, name } = props;

    const [split] = useSplitHeroes();
    const { total } = data;
    const variantLabels = useMemo(() => withVariantLabels(data.labels), [data.labels]);
    const apart = split && !!total.mineVariants && !!total.theirsVariants;
    const labels = apart ? variantLabels : data.labels;
    const mine = (apart && total.mineVariants) || total.mine;
    const theirs = (apart && total.theirsVariants) || total.theirs;

    const opponent = data.mode === 'player' ? data.opponents[0] : undefined;

    return (
        <div className='versus-pair'>
            <Panel title={`${name}’s loadouts`} note='Record with each'>
                <LoadoutTable rows={mine} labels={labels} />
            </Panel>
            <Panel
                title={opponent ? `${playerLabel(opponent)}’s loadouts` : 'Their loadouts'}
                note={`${name}’s record against each`}
            >
                <LoadoutTable rows={theirs} labels={labels} />
            </Panel>
        </div>
    );
}
