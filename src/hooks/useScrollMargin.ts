import { useLayoutEffect, useState, type RefObject } from 'react';

/**
 * Where `target` starts in its scroller's content (in the page, without a scroller): a
 * virtualizer's `scrollMargin`. Measured again whenever the scroller (or the page) resizes.
 * `remeasureKey`: a change measures again, for a target that wasn't rendered at first.
 */
export default function useScrollMargin(
    target: RefObject<HTMLElement | null>,
    scroller?: RefObject<HTMLElement | null>,
    remeasureKey?: unknown,
) {
    const [margin, setMargin] = useState(0);

    useLayoutEffect(() => {
        const el = target.current;
        if (!el) return;
        const box = scroller?.current ?? null;
        const measure = () => {
            const top = el.getBoundingClientRect().top;
            setMargin(
                box ? top - box.getBoundingClientRect().top + box.scrollTop : top + window.scrollY,
            );
        };
        measure();
        // the page moving the target, or what sits above it in its own box (a table's head)
        const observer = new ResizeObserver(measure);
        observer.observe(box ?? document.body);
        if (el.parentElement) observer.observe(el.parentElement);
        return () => observer.disconnect();
    }, [target, scroller, remeasureKey]);

    return margin;
}
