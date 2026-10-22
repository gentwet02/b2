import Panel from '@/components/panel/Panel';
import PanelEmpty from '@/components/panel/PanelEmpty';
import type { BloonStat } from '@/types/profile';
import { formatLabel, formatNumber } from '@/utils/format';

interface BloonStatsProps {
    bloons: BloonStat[];
}

export default function BloonStats(props: BloonStatsProps) {
    const { bloons } = props;

    const top = [...bloons].sort((a, b) => b.sends - a.sends).slice(0, 10);

    return (
        <Panel title='Bloons sent and popped'>
            {top.length === 0 ? (
                <PanelEmpty>No bloon stats recorded yet.</PanelEmpty>
            ) : (
                <table className='bloon-stats'>
                    <thead>
                        <tr>
                            <th scope='col'>Bloon</th>
                            <th scope='col'>Sent</th>
                            <th scope='col'>Popped</th>
                        </tr>
                    </thead>
                    <tbody>
                        {top.map((bloon) => (
                            <tr key={bloon.bloon_type}>
                                <th scope='row'>{formatLabel(bloon.bloon_type)}</th>
                                <td>{formatNumber(bloon.sends)}</td>
                                <td>{formatNumber(bloon.pops)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </Panel>
    );
}
