import { useLayoutEffect, useRef, useState } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import { TABLE_VIRTUAL_OVERSCAN, TABLE_VIRTUAL_ROW_ESTIMATE } from '@/config/table';
import type { Category, Row } from '@/types/table';
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
    // where the rows start in the page: the virtualizer works in window scroll offsets
    const [offset, setOffset] = useState(0);

    useLayoutEffect(() => {
        const body = bodyRef.current;
        if (!body) return;
        const measure = () => setOffset(body.getBoundingClientRect().top + window.scrollY);
        measure();
        // whatever moves the table (the header loading, the controls wrapping) resizes the body
        const observer = new ResizeObserver(measure);
        observer.observe(document.body);
        return () => observer.disconnect();
        // no rows: the empty body has no ref, measure once rows come
    }, [empty]);

    const virtualizer = useWindowVirtualizer({
        count: data.length,
        estimateSize: () => TABLE_VIRTUAL_ROW_ESTIMATE,
        overscan: TABLE_VIRTUAL_OVERSCAN,
        scrollMargin: offset,
    });

    if (empty) return <TableBody categories={categories} data={data} />;

    const items = virtualizer.getVirtualItems();
    const first = items[0];
    const last = items[items.length - 1];
    const before = first ? first.start - offset : 0;
    const after = last ? virtualizer.getTotalSize() - (last.end - offset) : 0;

    return (
        <tbody ref={bodyRef}>
            {before > 0 && (
                <tr className='table__spacer' aria-hidden='true'>
                    <td colSpan={categories.length} style={{ blockSize: before }} />
                </tr>
            )}
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
            {after > 0 && (
                <tr className='table__spacer' aria-hidden='true'>
                    <td colSpan={categories.length} style={{ blockSize: after }} />
                </tr>
            )}
        </tbody>
    );
}
