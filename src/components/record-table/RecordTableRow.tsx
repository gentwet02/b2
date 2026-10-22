import type { ReactNode } from 'react';
import RateBar from '@/components/rate-bar/RateBar';
import type { RecordColumn, Wld } from '@/types/record';
import { formatNumber } from '@/utils/format';
import { formatRecord, gamesOf, rateOf, recordTitle } from '@/utils/record';
import RecordTableCell from './RecordTableCell';

interface RecordTableRowProps<T extends { record: Wld }> {
    row: T;
    /** the first cell, pinned while scrolling sideways */
    label: ReactNode;
    columns: RecordColumn<T>[];
    after: RecordColumn<T>[];
}

/** One row: its label, extra columns, games, W–D–L and win rate bar. */
export default function RecordTableRow<T extends { record: Wld }>(props: RecordTableRowProps<T>) {
    const { row, label, columns, after } = props;

    const games = gamesOf(row.record);

    return (
        <tr>
            <th scope='row'>{label}</th>
            {columns.map((col) => (
                <RecordTableCell key={col.title} column={col} row={row} />
            ))}
            <td className='record-table__num'>{games ? formatNumber(games) : '–'}</td>
            <td className='record-table__num' title={recordTitle(row.record)}>
                {games ? formatRecord(row.record) : '–'}
            </td>
            <td>
                <RateBar rate={rateOf(row.record)} title={recordTitle(row.record)} />
            </td>
            {after.map((col, i) => (
                <RecordTableCell key={col.title || `after-${i}`} column={col} row={row} />
            ))}
        </tr>
    );
}
