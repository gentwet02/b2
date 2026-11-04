import FoundAs from '@/components/text/FoundAs';
import type { DropdownKeyword } from '@/types/dropdown';
import { mods } from '@/utils/className';

interface DropdownOptionProps {
    id: string;
    index: number;
    label: string;
    /** the hidden keyword the search found this option by (e.g. an old name) */
    matched?: DropdownKeyword | undefined;
    /** where the arrow keys / pointer are */
    active: boolean;
    /** the selected value */
    current: boolean;
    onHover: () => void;
    onSelect: () => void;
}

export default function DropdownOption(props: DropdownOptionProps) {
    const { id, index, label, matched, active, current, onHover, onSelect } = props;

    const className = mods('dropdown__option', active && 'active', current && 'current');

    return (
        <li
            id={id}
            data-index={index}
            role='option'
            aria-selected={active}
            className={className}
            // keep the focus in the input
            onMouseDown={(event) => event.preventDefault()}
            onMouseMove={onHover}
            onClick={onSelect}
        >
            {label}
            {matched && <FoundAs found={matched} className='dropdown__option-matched' />}
        </li>
    );
}
