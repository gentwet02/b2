import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { ChevronDownIcon } from '@/components/icons';

interface DropdownInputProps {
    id: string;
    listboxId: string;
    /** the option the arrow keys are on */
    activeOptionId: string | undefined;
    /** the selected label, or what's typed */
    value: string;
    isOpen: boolean;
    searchable: boolean;
    disabled: boolean;
    autoFocus: boolean;
    placeholder: string | undefined;
    className: string | undefined;
    iconSize: number;
    'aria-label': string | undefined;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
    onClick: (event: MouseEvent<HTMLInputElement>) => void;
    onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

/** The combobox input and its chevron. Read only unless searchable: then it filters. */
export default function DropdownInput(props: DropdownInputProps) {
    const {
        id,
        listboxId,
        activeOptionId,
        value,
        isOpen,
        searchable,
        disabled,
        autoFocus,
        placeholder,
        className,
        iconSize,
        'aria-label': ariaLabel,
        onChange,
        onClick,
        onKeyDown,
    } = props;

    return (
        <div className='dropdown__input-wrapper'>
            <input
                id={id}
                name={id}
                type='text'
                role='combobox'
                aria-label={ariaLabel}
                aria-expanded={isOpen}
                aria-controls={listboxId}
                aria-autocomplete={searchable ? 'list' : 'none'}
                aria-activedescendant={activeOptionId}
                autoComplete='off'
                autoFocus={autoFocus}
                disabled={disabled}
                readOnly={!searchable}
                placeholder={placeholder}
                className={className ? `dropdown__input ${className}` : 'dropdown__input'}
                value={value}
                onChange={onChange}
                onClick={onClick}
                onKeyDown={onKeyDown}
            />
            <ChevronDownIcon
                className='dropdown__icon'
                aria-hidden='true'
                width={iconSize}
                height={iconSize}
                rotate={isOpen}
            />
        </div>
    );
}
