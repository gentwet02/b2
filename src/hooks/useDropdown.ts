import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, KeyboardEvent, MouseEvent } from 'react';
import type { DropdownItem, DropdownOption, DropdownValue } from '@/types/dropdown';

interface UseDropdownOptions<V extends DropdownValue> {
    options: readonly DropdownOption<V>[];
    value: V | '';
    onSelect: (value: V) => void;
    disabled: boolean;
    searchable: boolean;
}

const isItem = <V extends DropdownValue>(option: DropdownOption<V>): option is DropdownItem<V> =>
    typeof option === 'object';

/**
 * State and keyboard / pointer handling of the Dropdown combobox: open and close, type to
 * filter, arrow keys, and the list kept on screen with its last options while it folds away.
 */
export default function useDropdown<V extends DropdownValue>(props: UseDropdownOptions<V>) {
    const { options, value, onSelect, disabled, searchable } = props;

    const rootRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const shouldScrollRef = useRef(false);

    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [isFiltering, setIsFiltering] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [spacerTop, setSpacerTop] = useState(0);
    // after closing, the list stays rendered with its last options until its exit animation ends
    const [exitItems, setExitItems] = useState<DropdownItem<V>[] | null>(null);
    const openItemsRef = useRef<DropdownItem<V>[]>([]);
    const wasOpenRef = useRef(false);

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
    const isClosing = !isOpen && exitItems !== null;
    const shownItems = isOpen ? filteredItems : (exitItems ?? []);

    useLayoutEffect(() => {
        if (isOpen) openItemsRef.current = filteredItems;
    }, [isOpen, filteredItems]);

    useLayoutEffect(() => {
        if (wasOpenRef.current && !isOpen) setExitItems(openItemsRef.current);
        if (isOpen) setExitItems(null);
        wasOpenRef.current = isOpen;
    }, [isOpen]);

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

    /** the pointer over an option */
    function hover(index: number) {
        if (index !== activeIndex) setActiveIndex(index);
    }

    /** the list's exit animation ended: stop rendering it */
    function finishClosing() {
        if (isClosing) setExitItems(null);
    }

    // a click outside closes it
    useEffect(() => {
        if (!isOpen) return;
        function handlePointerDown(event: PointerEvent) {
            if (!rootRef.current?.contains(event.target as Node)) close();
        }
        document.addEventListener('pointerdown', handlePointerDown);
        return () => document.removeEventListener('pointerdown', handlePointerDown);
    }, [isOpen, close]);

    // keyboard moves keep the active option in view
    useEffect(() => {
        if (!isOpen || !shouldScrollRef.current) return;
        shouldScrollRef.current = false;
        listRef.current
            ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
            ?.scrollIntoView({ block: 'nearest' });
    }, [isOpen, activeIndex]);

    // the spacer under the open list, so the page can scroll to its end
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

    return {
        rootRef,
        listRef,
        isOpen,
        isClosing,
        isEmpty: isOpen && filteredItems.length === 0,
        inputValue,
        shownItems,
        activeIndex,
        activeItem,
        spacerTop,
        select,
        hover,
        finishClosing,
        handleChange,
        handleClick,
        handleKeyDown,
    };
}
