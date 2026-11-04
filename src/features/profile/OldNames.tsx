import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@/components/icons';
import { bem } from '@/utils/className';
import { plural } from '@/utils/format';

interface OldNamesProps {
    /** most recently used first */
    names: string[];
}

/** Page offsets of the open list, under its button and kept inside the viewport. */
interface ListPosition {
    top: number;
    left: number;
    minWidth: number;
}

const VIEWPORT_MARGIN = 12;

/**
 * The names a player went by before: the latest on the button, all of them, newest first, in a
 * list that floats over the page (the profile header clips its overflow, and shouldn't
 * grow).
 */
export default function OldNames(props: OldNamesProps) {
    const { names } = props;

    const buttonRef = useRef<HTMLButtonElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const [open, setOpen] = useState(false);
    const [position, setPosition] = useState<ListPosition | null>(null);
    const listId = useId();

    useLayoutEffect(() => {
        if (!open) return;
        function place() {
            const button = buttonRef.current;
            if (!button) return;
            const rect = button.getBoundingClientRect();
            const width = listRef.current?.offsetWidth ?? rect.width;
            const maxLeft = window.innerWidth - width - VIEWPORT_MARGIN;
            setPosition({
                top: rect.bottom + window.scrollY + 4,
                left: Math.max(VIEWPORT_MARGIN, Math.min(rect.left, maxLeft)) + window.scrollX,
                minWidth: rect.width,
            });
        }
        place();
        window.addEventListener('resize', place);
        return () => window.removeEventListener('resize', place);
    }, [open]);

    // a click outside or Escape closes it
    useEffect(() => {
        if (!open) return;
        function handlePointerDown(event: PointerEvent) {
            const target = event.target as Node;
            if (buttonRef.current?.contains(target) || listRef.current?.contains(target)) return;
            setOpen(false);
        }
        function handleKeyDown(event: KeyboardEvent) {
            if (event.key !== 'Escape') return;
            setOpen(false);
            buttonRef.current?.focus();
        }
        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open]);

    const [latest, ...rest] = names;
    if (!latest) return null;

    return (
        <>
            <button
                ref={buttonRef}
                type='button'
                className={bem('old-names', open && 'open')}
                aria-expanded={open}
                aria-controls={listId}
                onClick={() => setOpen((was) => !was)}
            >
                <span>
                    Formerly <strong>{latest}</strong>
                    {rest.length > 0 && ` and ${rest.length} other ${plural(rest.length, 'name')}`}
                </span>
                <span className='old-names__chevron' aria-hidden='true'>
                    <ChevronDownIcon width={12} height={12} />
                </span>
            </button>
            {open &&
                createPortal(
                    <ul
                        ref={listRef}
                        id={listId}
                        className='old-names__list'
                        aria-label='Names this player went by before'
                        style={{
                            insetBlockStart: position?.top ?? 0,
                            insetInlineStart: position?.left ?? 0,
                            minInlineSize: position?.minWidth,
                            visibility: position ? 'visible' : 'hidden',
                        }}
                    >
                        {names.map((name) => (
                            <li key={name} className='old-names__item'>
                                {name}
                            </li>
                        ))}
                    </ul>,
                    document.getElementById('root') ?? document.body,
                )}
        </>
    );
}
