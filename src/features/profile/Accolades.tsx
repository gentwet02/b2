import Panel from '@/components/panel/Panel';
import type { Accolade } from '@/types/profile';
import { formatLabel, formatNumber } from '@/utils/format';

interface AccoladesProps {
    accolades: Accolade[];
}

export default function Accolades(props: AccoladesProps) {
    const { accolades } = props;

    if (accolades.length === 0) return null;

    return (
        <Panel title='Accolades'>
            <ul className='accolades'>
                {accolades.map((accolade, i) => (
                    <li
                        key={`${accolade.type}-${accolade.subtype}-${i}`}
                        className='accolades__item'
                    >
                        <span className='accolades__value'>{formatNumber(accolade.value)}</span>
                        <span className='accolades__type'>{formatLabel(accolade.type)}</span>
                        {accolade.subtype && accolade.subtype !== 'None' && (
                            <span className='accolades__subtype'>
                                {formatLabel(accolade.subtype)}
                            </span>
                        )}
                    </li>
                ))}
            </ul>
        </Panel>
    );
}
