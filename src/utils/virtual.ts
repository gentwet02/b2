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
        before: first ? first.start - margin : 0,
        after: last ? virtualizer.getTotalSize() - (last.end - margin) : 0,
    };
}
