import { useMemo, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import PanelEmpty from '@/components/panel/PanelEmpty';
import VirtualSpacer from '@/components/virtual/VirtualSpacer';
import { RECORD_TABLE_OVERSCAN, RECORD_TABLE_ROW_ESTIMATE } from '@/config/table';
import useScrollMargin from '@/hooks/useScrollMargin';
import type { RecordColumn, RecordSortKey, RecordSortState, Wld } from '@/types/record';
import { cx } from '@/utils/className';
import { formatNumber } from '@/utils/format';
import { formatRecord, gamesOf, recordComparator, sortRecords } from '@/utils/record';
import { virtualWindow } from '@/utils/virtual';
import RecordTableHead from './RecordTableHead';
import RecordTableRow from './RecordTableRow';

interface RecordTableProps<T extends { record: Wld }> {
    rows: T[];
    rowKey: (row: T) => string;
    /**
     * First column, pinned while scrolling sideways.
     * `sort`: A–Z order (the header becomes a sort button), see `byText`.
     */
    label: { title: string; render: (row: T) => ReactNode; sort?: (a: T, b: T) => number };
    /** between the label and the record columns */
    columns?: RecordColumn<T>[];
    /** after the record columns */
    after?: RecordColumn<T>[];
    empty?: ReactNode;
    /** 'none' keeps the rows' order until a header is clicked */
    initialSort?: 'games' | 'rate' | 'none';
    /** on the table, for a page's own layout rules */
    className?: string | undefined;
}

/**
 * Rows with a record: games, W–D–L, win rate; sortable both ways, sticky head and first column.
 * Every row scrolls in the table's box, only the ones in view rendered.
 */
export default function RecordTable<T extends { record: Wld }>(props: RecordTableProps<T>) {
    const { rows, rowKey, label, columns = [], after = [], empty, className } = props;

    const [sort, setSort] = useState<RecordSortState>({
        key: props.initialSort ?? 'games',
        reversed: false,
    });

    const sorted = sortRecords(
        rows,
        sort,
        recordComparator(sort.key, label.sort, [...columns, ...after]),
    );

    // the widest games and W–D–L of every row, not only the rendered ones: the columns keep
    // their width while the rows scroll by
    const widths = useMemo(() => {
        let games = 0;
        let record = 0;
        for (const r of rows) {
            games = Math.max(games, formatNumber(gamesOf(r.record)).length);
            record = Math.max(record, formatRecord(r.record).length);
        }
        return { '--games-chars': games, '--record-chars': record } as CSSProperties;
    }, [rows]);

    const scrollRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLTableSectionElement>(null);
    // below the sticky head; nothing to measure until there are rows
    const margin = useScrollMargin(bodyRef, scrollRef, rows.length === 0);
    // the compiler warning: this app isn't built with the React Compiler, nothing is memoized
    // eslint-disable-next-line react-hooks/incompatible-library
    const virtualizer = useVirtualizer({
        count: sorted.length,
        getScrollElement: () => scrollRef.current,
        estimateSize: () => RECORD_TABLE_ROW_ESTIMATE,
        overscan: RECORD_TABLE_OVERSCAN,
        scrollMargin: margin,
        // a row keeps its measured height when a sort moves it
        getItemKey: (i) => rowKey(sorted[i]!),
    });

    if (rows.length === 0) return <PanelEmpty>{empty ?? 'Nothing yet.'}</PanelEmpty>;

    const click = (key: RecordSortKey) =>
        setSort((prev) => ({ key, reversed: prev.key === key ? !prev.reversed : false }));
    const { items, before, after: below } = virtualWindow(virtualizer);
    const columnCount = 1 + columns.length + 3 + after.length;

    return (
        <div className='record-table-scroll' ref={scrollRef}>
            <table
                className={cx('record-table', className)}
                style={widths}
                aria-rowcount={sorted.length + 1}
            >
                <RecordTableHead
                    label={{ title: label.title, sortable: !!label.sort }}
                    columns={columns}
                    after={after}
                    anyDraw={rows.some((r) => r.record[2] > 0)}
                    sort={sort}
                    onSort={click}
                />
                <tbody ref={bodyRef}>
                    <VirtualSpacer size={before} columns={columnCount} />
                    {items.map((item) => {
                        const row = sorted[item.index]!;
                        return (
                            <RecordTableRow
                                key={item.key}
                                ref={virtualizer.measureElement}
                                index={item.index}
                                row={row}
                                label={label.render(row)}
                                columns={columns}
                                after={after}
                            />
                        );
                    })}
                    <VirtualSpacer size={below} columns={columnCount} />
                </tbody>
            </table>
        </div>
    );
}
