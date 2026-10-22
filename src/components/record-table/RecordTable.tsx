import { useState, type ReactNode } from 'react';
import PanelEmpty from '@/components/panel/PanelEmpty';
import type { RecordColumn, RecordSortKey, RecordSortState, Wld } from '@/types/record';
import { recordComparator, sortRecords } from '@/utils/record';
import RecordTableHead from './RecordTableHead';
import RecordTableMore from './RecordTableMore';
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
    /** rows shown at first, then this many more per click */
    pageSize?: number | undefined;
}

/** Rows with a record: games, W–D–L, win rate; sortable both ways, sticky head and first column. */
export default function RecordTable<T extends { record: Wld }>(props: RecordTableProps<T>) {
    const { rows, rowKey, label, columns = [], after = [], empty, pageSize } = props;

    const [sort, setSort] = useState<RecordSortState>({
        key: props.initialSort ?? 'games',
        reversed: false,
    });
    const [shown, setShown] = useState(pageSize ?? Infinity);

    const sorted = sortRecords(
        rows,
        sort,
        recordComparator(sort.key, label.sort, [...columns, ...after]),
    );

    if (rows.length === 0) return <PanelEmpty>{empty ?? 'Nothing yet.'}</PanelEmpty>;

    const click = (key: RecordSortKey) =>
        setSort((prev) => ({ key, reversed: prev.key === key ? !prev.reversed : false }));
    const step = pageSize ?? sorted.length;

    return (
        <div className='record-table-scroll'>
            <table className={`record-table record-table--${label.title.toLowerCase()}`}>
                <RecordTableHead
                    label={{ title: label.title, sortable: !!label.sort }}
                    columns={columns}
                    after={after}
                    anyDraw={rows.some((r) => r.record[2] > 0)}
                    sort={sort}
                    onSort={click}
                />
                <tbody>
                    {sorted.slice(0, shown).map((row) => (
                        <RecordTableRow
                            key={rowKey(row)}
                            row={row}
                            label={label.render(row)}
                            columns={columns}
                            after={after}
                        />
                    ))}
                </tbody>
            </table>
            {sorted.length > shown && (
                <RecordTableMore
                    next={Math.min(step, sorted.length - shown)}
                    left={sorted.length - shown}
                    onClick={() => setShown(shown + step)}
                />
            )}
        </div>
    );
}
