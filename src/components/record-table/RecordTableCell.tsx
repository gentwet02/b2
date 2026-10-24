import type { RecordColumn } from '@/types/record';

interface RecordTableCellProps<T> {
    column: RecordColumn<T>;
    row: T;
}

/** A row's value in one of the extra columns. */
export default function RecordTableCell<T>(props: RecordTableCellProps<T>) {
    const { column, row } = props;

    const className = [column.numeric && 'record-table__num', column.className]
        .filter(Boolean)
        .join(' ');

    return <td className={className || undefined}>{column.render(row)}</td>;
}
