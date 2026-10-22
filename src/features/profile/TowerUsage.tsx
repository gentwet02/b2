import Panel from '@/components/panel/Panel';
import PanelEmpty from '@/components/panel/PanelEmpty';
import type { Tower } from '@/types/profile';
import { formatLabel, formatNumber } from '@/utils/format';

interface TowerUsageProps {
    towers: Tower[];
}

export default function TowerUsage(props: TowerUsageProps) {
    const { towers } = props;

    const used = towers.filter((t) => t.used > 0).sort((a, b) => b.used - a.used);
    const top = used.slice(0, 10);
    const max = top[0]?.used ?? 1;

    return (
        <Panel title='Most played towers'>
            {top.length === 0 ? (
                <PanelEmpty>No tower usage recorded yet.</PanelEmpty>
            ) : (
                <ol className='tower-usage'>
                    {top.map((tower) => (
                        <li key={tower.type} className='tower-usage__item'>
                            <span className='tower-usage__name'>{formatLabel(tower.type)}</span>
                            <span className='tower-usage__count'>{formatNumber(tower.used)}</span>
                            <span className='tower-usage__track' aria-hidden='true'>
                                <span
                                    className='tower-usage__fill'
                                    style={{ width: `${(tower.used / max) * 100}%` }}
                                />
                            </span>
                        </li>
                    ))}
                </ol>
            )}
        </Panel>
    );
}
