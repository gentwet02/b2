import { useLayoutEffect, useState, type RefObject } from 'react';

/** Each kind of list's learned row height, and the window width it was learned at. */
const learned = new Map<string, { width: number; size: number }>();

/**
 * A virtual list's row estimate (px): `fallback` until its first rows are rendered, then their
 * average height, kept for the next list of that `kind` (another profile, coming back to one).
 * Rows above the viewport that were never rendered are laid out at the estimate, and the
 * virtualizer moves the scroll by the error as each one comes in: far from the real height (a
 * card is 190px on a desktop, over 500px on a phone), scrolling up stutters and jumps.
 */
export default function useRowEstimate(
    list: RefObject<HTMLElement | null>,
    kind: string,
    fallback: number,
) {
    const [estimate, setEstimate] = useState(() => {
        const known = learned.get(kind);
        // rows reflow with the window: a height learned at another width is no better a guess
        return known?.width === window.innerWidth ? known.size : fallback;
    });
    useLayoutEffect(() => {
        const el = list.current;
        if (!el) return;
        // the rows come a render or two after the list, once the virtualizer knows the viewport:
        // the list resizes then. Once only: a new estimate moves every unmeasured row.
        const observer = new ResizeObserver(() => {
            const rows = el.children;
            if (rows.length === 0) return;
            observer.disconnect();
            let total = 0;
            for (const row of rows) total += row.getBoundingClientRect().height;
            const size = Math.round(total / rows.length);
            learned.set(kind, { width: window.innerWidth, size });
            setEstimate(size);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [list, kind]);

    return estimate;
}
