import type { Virtualizer } from '@tanstack/react-virtual';

/** The items to render, and the space the ones before and after them would take (px). */
export function virtualWindow<S extends Element | Window, I extends Element>(
    virtualizer: Virtualizer<S, I>,
) {
    const items = virtualizer.getVirtualItems();
    const margin = virtualizer.options.scrollMargin;
    const first = items[0];
    const last = items[items.length - 1];
    return {
        items,
        // never negative: the virtualizer shifts the items back while it holds a scroll
        // correction (iOS, mid-swipe), and the browser drops a negative padding
        before: first ? Math.max(0, first.start - margin) : 0,
        // nothing rendered (the viewport isn't known on the first render): still the full height
        after: virtualizer.getTotalSize() - (last ? last.end - margin : 0),
    };
}

/**
 * A window virtualizer's `scrollToFn`. When a card above the viewport turns out taller or shorter
 * than estimated, the virtualizer moves the scroll by the difference so nothing shifts on screen.
 * It leaves `behavior` unset for that, and the page's `scroll-behavior: smooth` (when the user
 * doesn't prefer reduced motion) would animate each correction: cards bounce and the scroll
 * fights the user's.
 */
export function windowScrollInstant(
    offset: number,
    options: { adjustments?: number; behavior?: ScrollBehavior },
) {
    const { adjustments = 0, behavior = 'instant' } = options;
    window.scrollTo({ top: offset + adjustments, behavior });
}
