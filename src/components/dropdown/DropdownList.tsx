import type { Ref } from 'react';
import type { DropdownItem, DropdownValue } from '@/types/dropdown';
import DropdownOption from './DropdownOption';

interface DropdownListProps<V extends DropdownValue> {
    ref: Ref<HTMLUListElement>;
    id: string;
    items: DropdownItem<V>[];
    /** the selected value */
    value: V | '';
    activeIndex: number;
    optionId: (index: number) => string;
    hidden: boolean;
    /** folding away: still shown until its animation ends */
    closing: boolean;
    /** shown instead of the options: nothing matches what's typed */
    empty: string | null;
    onHover: (index: number) => void;
    onSelect: (item: DropdownItem<V>) => void;
    onClosed: () => void;
}

/** The listbox under the input. */
export default function DropdownList<V extends DropdownValue>(props: DropdownListProps<V>) {
    const {
        ref,
        id,
        items,
        value,
        activeIndex,
        optionId,
        hidden,
        closing,
        empty,
        onHover,
        onSelect,
        onClosed,
    } = props;

    return (
        <ul
            ref={ref}
            id={id}
            role='listbox'
            className={closing ? 'dropdown__list dropdown__list--closing' : 'dropdown__list'}
            hidden={hidden}
            onClick={(event) => event.preventDefault()}
            onAnimationEnd={(event) => {
                if (event.target === event.currentTarget) onClosed();
            }}
        >
            {empty !== null ? (
                <li
                    className='dropdown__empty'
                    role='option'
                    aria-disabled='true'
                    aria-selected='false'
                >
                    {empty}
                </li>
            ) : (
                items.map((item, index) => (
                    <DropdownOption
                        key={String(item.value)}
                        id={optionId(index)}
                        index={index}
                        label={item.label}
                        active={index === activeIndex}
                        current={item.value === value}
                        onHover={() => onHover(index)}
                        onSelect={() => onSelect(item)}
                    />
                ))
            )}
        </ul>
    );
}
