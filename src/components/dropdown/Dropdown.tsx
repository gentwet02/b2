import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@/components/icons';

export type DropdownValue = string | number;

export interface DropdownItem<V extends DropdownValue> {
    value: V;
    label: string;
}

export type DropdownOption<V extends DropdownValue> = V | DropdownItem<V>;

interface DropdownProps<V extends DropdownValue> {
    options: readonly DropdownOption<V>[];
    value: V | '';
    onSelect: (value: V) => void;
    id?: string;
    className?: string;
    inputClassName?: string;
    placeholder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    searchable?: boolean;
    variant?: 'default' | 'compact' | 'pill';
    noResultsText?: string;
    'aria-label'?: string;
}

const SEARCH_THRESHOLD = 8;

function isItem<V extends DropdownValue>(option: DropdownOption<V>): option is DropdownItem<V> {
    return typeof option === 'object';
}

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
        searchable = options.length > SEARCH_THRESHOLD,
        variant = 'default',
        noResultsText = 'No matches found',
        'aria-label': ariaLabel,
    } = props;

    const generatedId = useId();
    const inputId = id ?? generatedId;
    const listboxId = `${inputId}-listbox`;
    const optionId = (index: number) => `${inputId}-option-${index}`;

    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const shouldScrollRef = useRef(false);

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isFiltering, setIsFiltering] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [spacerTop, setSpacerTop] = useState(0);

    const items = useMemo(
        () =>
            options.map((option) =>
                isItem(option) ? option : { value: option, label: String(option) },
            ),
        [options],
    );

    const selectedIndex = items.findIndex((item) => item.value === value);
    const selectedLabel = items[selectedIndex]?.label ?? '';
    const inputValue = isFiltering ? query : selectedLabel;

    const filteredItems = useMemo(() => {
        const search = query.trim().toLowerCase();
        if (!isFiltering || !search) return items;
        return items.filter((item) => item.label.toLowerCase().includes(search));
    }, [items, query, isFiltering]);

    const activeItem: DropdownItem<V> | undefined = isOpen ? filteredItems[activeIndex] : undefined;

    const close = useCallback(() => {
        setIsOpen(false);
        setIsFiltering(false);
        setQuery('');
        setActiveIndex(-1);
    }, []);

    function open() {
        if (disabled) return;
        setIsOpen(true);
        setIsFiltering(false);
        setActiveIndex(Math.max(selectedIndex, 0));
        shouldScrollRef.current = true;
    }

    function select(item: DropdownItem<V>) {
        close();
        if (item.value !== value) onSelect(item.value);
    }

    function moveTo(index: number) {
        if (index === activeIndex) return;
        shouldScrollRef.current = true;
        setActiveIndex(index);
    }

    useEffect(() => {
        if (!isOpen) return;
        function handlePointerDown(event: PointerEvent) {
            if (!rootRef.current?.contains(event.target as Node)) close();
        }
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [isOpen, close]);

    useEffect(() => {
        if (!isOpen || !shouldScrollRef.current) return;
        shouldScrollRef.current = false;
        listRef.current
            ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [isOpen, activeIndex]);

    useLayoutEffect(() => {
        if (!isOpen || !rootRef.current || !listRef.current) return;
        const { top, height } = rootRef.current.getBoundingClientRect();
        setSpacerTop(top + window.scrollY + height + listRef.current.offsetHeight);
    }, [isOpen, filteredItems.length]);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        if (!searchable) return;
        setQuery(event.target.value);
        setIsFiltering(true);
        setIsOpen(true);
        setActiveIndex(0);
        if (listRef.current) listRef.current.scrollTop = 0;
    }

    function handleClick(event: MouseEvent<HTMLInputElement>) {
        if (isOpen) {
            close();
            return;
        }
        open();
        if (searchable && inputValue) event.currentTarget.select();
    }

    function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        switch (event.key) {
            case 'ArrowDown':
            case 'ArrowUp': {
                event.preventDefault();
                if (!isOpen) {
                    open();
                    return;
                }
                const last = filteredItems.length - 1;
                if (last < 0) return;
                if (event.key === 'ArrowDown') moveTo(activeIndex >= last ? 0 : activeIndex + 1);
                else moveTo(activeIndex <= 0 ? last : activeIndex - 1);
                break;
            }
            case 'Enter':
                if (!isOpen) return;
                event.preventDefault();
                if (activeItem) select(activeItem);
                break;
            case 'Escape':
                if (!isOpen) return;
                event.preventDefault();
                close();
                break;
            case 'Tab':
                if (isOpen) close();
                break;
        }
    }

    const rootClassName = [
        'dropdown',
        variant !== 'default' && `dropdown--${variant}`,
        isOpen && 'dropdown--open',
        className,
    ]
        .filter(Boolean)
        .join(' ');

    const iconSize = { default: 16, compact: 12, pill: 10 }[variant];

    return (
        <div ref={rootRef} className={rootClassName}>
            <div className='dropdown__input-wrapper'>
                <input
                    id={inputId}
                    name={inputId}
                    type='text'
                    role='combobox'
                    aria-label={ariaLabel}
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-autocomplete={searchable ? 'list' : 'none'}
                    aria-activedescendant={activeItem ? optionId(activeIndex) : undefined}
                    autoComplete='off'
                    autoFocus={autoFocus}
                    disabled={disabled}
                    readOnly={!searchable}
                    placeholder={placeholder}
                    className={
                        inputClassName ? `dropdown__input ${inputClassName}` : 'dropdown__input'
                    }
                    value={inputValue}
                    onChange={handleChange}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                />
                <ChevronDownIcon
                    className='dropdown__icon'
                    aria-hidden='true'
                    width={iconSize}
                    height={iconSize}
                    rotate={isOpen}
                />
            </div>

            <ul
                ref={listRef}
                id={listboxId}
                role='listbox'
                className='dropdown__list'
                hidden={!isOpen}
                onClick={(event) => event.preventDefault()}
            >
                {filteredItems.length === 0 ? (
                    <li
                        className='dropdown__empty'
                        role='option'
                        aria-disabled='true'
                        aria-selected='false'
                    >
                        {noResultsText}
                    </li>
                ) : (
                    isOpen &&
                    filteredItems.map((item, index) => {
                        const isActive = index === activeIndex;
                        const isCurrent = item.value === value;
                        return (
                            <li
                                key={String(item.value)}
                                id={optionId(index)}
                                data-index={index}
                                role='option'
                                aria-selected={isActive}
                                className={[
                                    'dropdown__option',
                                    isActive && 'dropdown__option--active',
                                    isCurrent && 'dropdown__option--current',
                                ]
                                    .filter(Boolean)
                                    .join(' ')}
                                onMouseDown={(event) => event.preventDefault()}
                                onMouseMove={() => {
                                    if (!isActive) setActiveIndex(index);
                                }}
                                onClick={() => select(item)}
                            >
                                {item.label}
                            </li>
                        );
                    })
                )}
            </ul>

            {isOpen &&
                createPortal(
                    <div
                        aria-hidden='true'
                        style={{
                            position: 'absolute',
                            left: 0,
                            right: 0,
                            top: spacerTop,
                            height: '1rem',
                            pointerEvents: 'none',
                        }}
                    />,
                    document.getElementById('root') ?? document.body,
                )}
        </div>
    );
}
