import Panel from '@/components/panel/Panel';
import PanelEmpty from '@/components/panel/PanelEmpty';
import { MOAB_CLASS } from '@/config/profile';
import type { BloonStat } from '@/types/profile';
import { formatLabel, formatNumber } from '@/utils/format';
import { bloonPicture } from '@/utils/unitImages';

interface BloonStatsProps {
    bloons: BloonStat[];
    /** the MOAB-class card instead of the regular bloons' */
    moabs?: boolean;
}

/** "BFB" or its decoy "BFB_Decoy" */
const isMoabClass = (type: string) => MOAB_CLASS.includes(type.split('_')[0] ?? type);

export default function BloonStats(props: BloonStatsProps) {
    const { bloons, moabs = false } = props;

    const top = bloons
        .filter((b) => isMoabClass(b.bloon_type) === moabs)
        .sort((a, b) => b.sends - a.sends);

    return (
        <Panel title={moabs ? 'MOAB class sent and popped' : 'Bloons sent and popped'}>
            {top.length === 0 ? (
                <PanelEmpty>
                    {moabs ? 'No MOAB-class stats recorded yet.' : 'No bloon stats recorded yet.'}
                </PanelEmpty>
            ) : (
                <div
                    className='bloon-stats__scroll'
                    tabIndex={0}
                    aria-label={moabs ? 'MOAB class, most sent first' : 'Bloons, most sent first'}
                >
                    <table className='bloon-stats'>
                        <thead>
                            <tr>
                                <th scope='col'>{moabs ? 'Blimp' : 'Bloon'}</th>
                                <th scope='col'>Sent</th>
                                <th scope='col'>Popped</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top.map((bloon) => (
                                <tr key={bloon.bloon_type}>
                                    <th scope='row'>
                                        <span className='bloon-stats__bloon'>
                                            <span className='bloon-stats__picture'>
                                                {bloonPicture(bloon.bloon_type) && (
                                                    <img
                                                        src={bloonPicture(bloon.bloon_type)}
                                                        alt=''
                                                    />
                                                )}
                                            </span>
                                            {formatLabel(bloon.bloon_type)}
                                        </span>
                                    </th>
                                    <td>{formatNumber(bloon.sends)}</td>
                                    <td>{formatNumber(bloon.pops)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Panel>
    );
}
