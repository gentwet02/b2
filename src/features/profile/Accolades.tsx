import type { Accolade } from '@/types/profile';
import { formatLabel, formatNumber } from '@/utils/format';

export default function Accolades({ accolades }: { accolades: Accolade[] }) {
    if (accolades.length === 0) return null;

    return (
        <section className='profile-panel'>
            <h2 className='profile-panel__title'>Accolades</h2>
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
        </section>
    );
}
