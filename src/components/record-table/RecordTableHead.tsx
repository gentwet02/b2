import type { RecordColumn, RecordSortKey, RecordSortState } from '@/types/record';
import RecordTableHeaderCell from './RecordTableHeaderCell';

interface RecordTableHeadProps<T> {
    label: { title: string; sortable: boolean };
    columns: RecordColumn<T>[];
    after: RecordColumn<T>[];
    /** "W–D–L" instead of "W–L" */
    anyDraw: boolean;
    sort: RecordSortState;
    onSort: (key: RecordSortKey) => void;
}

/** The label, the extra columns, games, record, win rate, then the columns after. */
export default function RecordTableHead<T>(props: RecordTableHeadProps<T>) {
    const { label, columns, after, anyDraw, sort, onSort } = props;

    // extra columns sort by their index among columns + after: "col:2"
    const extra = (col: RecordColumn<T>, index: number, key: string) => (
        <RecordTableHeaderCell
            key={key}
            title={col.title}
            sortKey={col.sort ? `col:${index}` : null}
            numeric={col.numeric}
            className={col.className}
            sort={sort}
            onSort={onSort}
        />
    );

    return (
        <thead>
            <tr>
                <RecordTableHeaderCell
                    title={label.title}
                    sortKey={label.sortable ? 'label' : null}
                    sort={sort}
                    onSort={onSort}
                />
                {columns.map((col, i) => extra(col, i, col.title))}
                <RecordTableHeaderCell
                    title='Games'
                    sortKey='games'
                    numeric
                    className='record-table__games'
                    sort={sort}
                    onSort={onSort}
                />
                <RecordTableHeaderCell
                    title={anyDraw ? 'W–D–L' : 'W–L'}
                    sortKey={null}
                    numeric
                    className='record-table__record'
                    sort={sort}
                    onSort={onSort}
                />
                <RecordTableHeaderCell
                    title='Win rate'
                    sortKey='rate'
                    className='record-table__rate'
                    sort={sort}
                    onSort={onSort}
                />
                {after.map((col, i) => extra(col, columns.length + i, col.title || `after-${i}`))}
            </tr>
        </thead>
    );
}
