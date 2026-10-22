import Dropdown from '@/components/dropdown/Dropdown';
import type { DropdownItem } from '@/types/dropdown';

interface ChipAdderProps<V extends string> {
    options: DropdownItem<V>[];
    placeholder: string;
    onAdd: (value: V) => void;
    searchable?: boolean;
    'aria-label': string;
}

/** The dashed "+ Add …" select at the end of a chip list. */
export default function ChipAdder<V extends string>(props: ChipAdderProps<V>) {
    const { options, placeholder, onAdd, searchable, 'aria-label': ariaLabel } = props;

    return (
        <Dropdown
            className='chip-adder'
            aria-label={ariaLabel}
            placeholder={placeholder}
            options={options}
            value=''
            searchable={searchable}
            onSelect={onAdd}
        />
    );
}
