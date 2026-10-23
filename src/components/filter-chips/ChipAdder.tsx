import Dropdown from '@/components/dropdown/Dropdown';
import type { DropdownItem } from '@/types/dropdown';

interface ChipAdderProps<V extends string> {
    options: DropdownItem<V>[];
    placeholder: string;
    onAdd: (value: V) => void;
    searchable?: boolean;
    /** adds an exclusion: red dashes */
    excluding?: boolean | undefined;
    'aria-label': string;
}

/** The dashed "+ Add …" (or "− Exclude …") select at the end of a chip list. */
export default function ChipAdder<V extends string>(props: ChipAdderProps<V>) {
    const { options, placeholder, onAdd, searchable, excluding, 'aria-label': ariaLabel } = props;

    return (
        <Dropdown
            className={excluding ? 'chip-adder chip-adder--exclude' : 'chip-adder'}
            aria-label={ariaLabel}
            placeholder={placeholder}
            options={options}
            value=''
            searchable={searchable}
            onSelect={onAdd}
        />
    );
}
