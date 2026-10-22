import type { RecordColumn } from '@/types/record';

interface RecordTableCellProps<T> {
    column: RecordColumn<T>;
    row: T;
}

/** A row's value in one of the extra columns. */
export default function RecordTableCell<T>(props: RecordTableCellProps<T>) {
    const { column, row } = props;

    return (
        <td className={column.numeric ? 'record-table__num' : undefined}>{column.render(row)}</td>
    );
}
