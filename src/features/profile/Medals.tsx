import Medal from '@/components/medal/Medal';
import Panel from '@/components/panel/Panel';
import { bySeason, readBadges } from '@/utils/badges';

interface MedalsProps {
    medals: unknown[] | undefined;
}

/** Every season medal the player earned, oldest first. */
export default function Medals(props: MedalsProps) {
    const medals = bySeason(readBadges(props.medals));

    if (medals.length === 0) return null;
    const count = `${medals.length} ${medals.length === 1 ? 'medal' : 'medals'}`;

    return (
        <Panel title='Medals' note={count}>
            <ul className='medals' aria-label={count}>
                {medals.map((medal) => (
                    <li key={medal.key} className='medals__item'>
                        <Medal badge={medal} />
                    </li>
                ))}
            </ul>
        </Panel>
    );
}
