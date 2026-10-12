import './Dropdown.scss';
import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@/components/icons';

interface DropdownProps<T extends string> {
    id?: string;
    options: readonly T[];
    value?: T | '';
    onSelect?: (option: T) => void;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
    autoFocus?: boolean;
    noResultsText?: string;
}

export default function Dropdown<T extends string>(props: DropdownProps<T>) {
    const {
        id,
        options,
        value = '',
        onSelect,
        className,
        placeholder,
        disabled = false,
        autoFocus = false,
        noResultsText = 'No matches found',
    } = props;

    const generatedId = useId();
    const inputId = id ?? generatedId;
    const listboxId = `${inputId}-listbox`;
    const optionId = (index: number) => `${inputId}-option-${index}`;

    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const shouldScrollRef = useRef(false);

    const [isOpen, setIsOpen] = useState(false);
    const [selected, setSelected] = useState<T | ''>(value);
    const [inputValue, setInputValue] = useState<string>(value);
    const [isFiltering, setIsFiltering] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [spacerTop, setSpacerTop] = useState(0);

    const [prevValue, setPrevValue] = useState(value);
    if (value !== prevValue) {
        setPrevValue(value);
        setSelected(value);
        setInputValue(value);
        setIsFiltering(false);
    }

    const filteredOptions = useMemo(() => {
        const query = inputValue.trim().toLowerCase();
        if (!isFiltering || !query) return options;
        return options.filter((option) => option.toLowerCase().includes(query));
    }, [options, inputValue, isFiltering]);

    const activeOption: T | undefined = isOpen ? filteredOptions[activeIndex] : undefined;

    const close = useCallback(() => {
        setIsOpen(false);
        setIsFiltering(false);
        setActiveIndex(-1);
        setInputValue(selected);
    }, [selected]);

    function open() {
        if (disabled) return;
        setIsOpen(true);
        setIsFiltering(false);
        setActiveIndex(
            Math.max(
                options.findIndex((option) => option === selected),
                0,
            ),
        );
        shouldScrollRef.current = true;
    }

    function select(option: T) {
        setIsOpen(false);
        setIsFiltering(false);
        setActiveIndex(-1);
        setSelected(option);
        setInputValue(option);
        onSelect?.(option);
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
    }, [isOpen, filteredOptions.length]);

    function handleChange(event: ChangeEvent<HTMLInputElement>) {
        setInputValue(event.target.value);
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
        if (inputValue) event.currentTarget.select();
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
                const last = filteredOptions.length - 1;
                if (last < 0) return;
                if (event.key === 'ArrowDown') moveTo(activeIndex >= last ? 0 : activeIndex + 1);
                else moveTo(activeIndex <= 0 ? last : activeIndex - 1);
                break;
            }
            case 'Enter':
                if (!isOpen) return;
                event.preventDefault();
                if (activeOption !== undefined) select(activeOption);
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

    return (
        <div ref={rootRef} className={`dropdown${isOpen ? ' dropdown--open' : ''}`}>
            <div className='dropdown__input-wrapper'>
                <input
                    id={inputId}
                    name={inputId}
                    type='text'
                    role='combobox'
                    aria-expanded={isOpen}
                    aria-controls={listboxId}
                    aria-autocomplete='list'
                    aria-activedescendant={
                        activeOption !== undefined ? optionId(activeIndex) : undefined
                    }
                    autoComplete='off'
                    autoFocus={autoFocus}
                    disabled={disabled}
                    placeholder={placeholder}
                    className={className ? `dropdown__input ${className}` : 'dropdown__input'}
                    value={inputValue}
                    onChange={handleChange}
                    onClick={handleClick}
                    onKeyDown={handleKeyDown}
                />
                <ChevronDownIcon className='dropdown__icon' aria-hidden='true' rotate={isOpen} />
            </div>

            <ul
                ref={listRef}
                id={listboxId}
                role='listbox'
                className='dropdown__list'
                hidden={!isOpen}
            >
                {filteredOptions.length === 0 ? (
                    <li
                        className='dropdown__empty'
                        role='option'
                        aria-disabled='true'
                        aria-selected='false'
                    >
                        {noResultsText}
                    </li>
                ) : (
                    filteredOptions.map((option, index) => {
                        const isActive = index === activeIndex;
                        const isCurrent = option === selected;
                        return (
                            <li
                                key={option}
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
                                onClick={() => select(option)}
                            >
                                {option}
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
