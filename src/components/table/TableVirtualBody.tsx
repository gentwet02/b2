import { useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import VirtualSpacer from '@/components/virtual/VirtualSpacer';
import { TABLE_VIRTUAL_OVERSCAN, TABLE_VIRTUAL_ROW_ESTIMATE } from '@/config/table';
import useScrollMargin from '@/hooks/useScrollMargin';
import type { Category, Row } from '@/types/table';
import { virtualWindow, windowScrollInstant } from '@/utils/virtual';
import TableBody from './TableBody';

interface TableVirtualBodyProps {
    categories: Category[];
    data: Row[];
}

/**
 * Every row, but only the ones near the viewport are in the DOM: spacer rows above and below
 * keep the page as tall as the full table, so the window scrolls as it would without this.
 */
export default function TableVirtualBody(props: TableVirtualBodyProps) {
    const { categories, data } = props;

    const empty = data.length === 0;
    const bodyRef = useRef<HTMLTableSectionElement>(null);
    // the empty body has no ref: measure once rows come
    const margin = useScrollMargin(bodyRef, undefined, empty);

    const virtualizer = useWindowVirtualizer({
        count: data.length,
        estimateSize: () => TABLE_VIRTUAL_ROW_ESTIMATE,
        overscan: TABLE_VIRTUAL_OVERSCAN,
        scrollMargin: margin,
        scrollToFn: windowScrollInstant,
    });

    if (empty) return <TableBody categories={categories} data={data} />;

    const { items, before, after } = virtualWindow(virtualizer);

    return (
        <tbody ref={bodyRef}>
            <VirtualSpacer size={before} columns={categories.length} />
            {items.map((item) => {
                const row = data[item.index]!;
                return (
                    <tr
                        key={item.key}
                        ref={virtualizer.measureElement}
                        data-index={item.index}
                        // the header row is 1
                        aria-rowindex={item.index + 2}
                        className='table__row'
                    >
                        {Object.keys(row).map((key) => (
                            <td key={key} className='table__cell'>
                                {row[key]}
                            </td>
                        ))}
                    </tr>
                );
            })}
            <VirtualSpacer size={after} columns={categories.length} />
        </tbody>
    );
}
