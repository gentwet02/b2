import { useId } from 'react';
import { DROPDOWN_ICON_SIZES, DROPDOWN_SEARCH_THRESHOLD } from '@/config/dropdown';
import useDropdown from '@/hooks/useDropdown';
import type { DropdownOption, DropdownValue, DropdownVariant } from '@/types/dropdown';
import DropdownInput from './DropdownInput';
import DropdownList from './DropdownList';
import DropdownSpacer from './DropdownSpacer';

interface DropdownProps<V extends DropdownValue> {
    options: readonly DropdownOption<V>[];
    value: V | '';
    onSelect: (value: V) => void;
    id?: string | undefined;
    className?: string | undefined;
    inputClassName?: string | undefined;
    placeholder?: string | undefined;
    disabled?: boolean | undefined;
    autoFocus?: boolean | undefined;
    /** type to filter the options (default: more than 8 of them) */
    searchable?: boolean | undefined;
    variant?: DropdownVariant | undefined;
    noResultsText?: string | undefined;
    'aria-label'?: string | undefined;
}

/** A select you can type in: a combobox input over a list of options. */
export default function Dropdown<V extends DropdownValue>(props: DropdownProps<V>) {
    const {
        options,
        value,
        onSelect,
        id,
        className,
        inputClassName,
        placeholder,
        disabled = false,
        autoFocus = false,
        searchable = options.length > DROPDOWN_SEARCH_THRESHOLD,
        variant = 'default',
        noResultsText = 'No matches found',
        'aria-label': ariaLabel,
    } = props;

    const generatedId = useId();
    const inputId = id ?? generatedId;
    const listboxId = `${inputId}-listbox`;
    const optionId = (index: number) => `${inputId}-option-${index}`;

    const dropdown = useDropdown({ options, value, onSelect, disabled, searchable });

    const rootClassName = [
        'dropdown',
        variant !== 'default' && `dropdown--${variant}`,
        dropdown.isOpen && 'dropdown--open',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div ref={dropdown.rootRef} className={rootClassName}>
            <DropdownInput
                id={inputId}
                listboxId={listboxId}
                activeOptionId={dropdown.activeItem ? optionId(dropdown.activeIndex) : undefined}
                value={dropdown.inputValue}
                isOpen={dropdown.isOpen}
                searchable={searchable}
                disabled={disabled}
                autoFocus={autoFocus}
                placeholder={placeholder}
                className={inputClassName}
                iconSize={DROPDOWN_ICON_SIZES[variant]}
                aria-label={ariaLabel}
                onChange={dropdown.handleChange}
                onClick={dropdown.handleClick}
                onKeyDown={dropdown.handleKeyDown}
            />

            <DropdownList
                ref={dropdown.listRef}
                id={listboxId}
                items={dropdown.shownItems}
                value={value}
                activeIndex={dropdown.activeIndex}
                optionId={optionId}
                hidden={!dropdown.isOpen && !dropdown.isClosing}
                closing={dropdown.isClosing}
                empty={dropdown.isEmpty ? noResultsText : null}
                onHover={dropdown.hover}
                onSelect={dropdown.select}
                onClosed={dropdown.finishClosing}
            />

            {dropdown.isOpen && <DropdownSpacer top={dropdown.spacerTop} />}
        </div>
    );
}
