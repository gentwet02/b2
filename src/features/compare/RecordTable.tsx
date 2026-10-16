import type { Wld } from '@/types/compare';
import { formatRate, formatRecord, gamesOf, rateOf, recordTitle } from '@/utils/compare';
import { formatNumber } from '@/utils/format';
import { Fragment, useState, type ReactNode } from 'react';

export interface RecordColumn<T> {
    title: string;
    render: (row: T) => ReactNode;
    /** ascending order; the header becomes a sort button */
    sort?: (a: T, b: T) => number;
    numeric?: boolean;
}

interface RecordTableProps<T extends { record: Wld }> {
    rows: T[];
    rowKey: (row: T) => string;
    /** first column, pinned while scrolling sideways */
    label: { title: string; render: (row: T) => ReactNode };
    /** between the label and the record columns */
    columns?: RecordColumn<T>[];
    /** after the record columns */
    after?: RecordColumn<T>[];
    empty?: ReactNode;
    /** 'none' keeps the rows' order until a header is clicked */
    initialSort?: 'games' | 'rate' | 'none';
    /** rows shown at first, then this many more per click */
    pageSize?: number;
}

type SortKey = 'games' | 'rate' | 'none' | `col:${number}`;

const byGames = (a: { record: Wld }, b: { record: Wld }) => gamesOf(b.record) - gamesOf(a.record);
const byRate = (a: { record: Wld }, b: { record: Wld }) =>
    (rateOf(b.record) ?? -1) - (rateOf(a.record) ?? -1) || byGames(a, b);

/** Rows with a record: games, W–L, win rate; sortable, sticky head and first column. */
export default function RecordTable<T extends { record: Wld }>(props: RecordTableProps<T>) {
    const { rows, rowKey, label, columns = [], after = [], empty } = props;
    const [sort, setSort] = useState<SortKey>(props.initialSort ?? 'games');
    const [shown, setShown] = useState(props.pageSize ?? Infinity);

    const extra = [...columns, ...after];
    const sorted = [...rows];
    if (sort === 'games') sorted.sort(byGames);
    else if (sort === 'rate') sorted.sort(byRate);
    else if (sort !== 'none') {
        const compare = extra[Number(sort.slice(4))]?.sort;
        if (compare) sorted.sort((a, b) => compare(a, b) || byGames(a, b));
    }

    if (rows.length === 0) return <p className='profile-panel__empty'>{empty ?? 'Nothing yet.'}</p>;

    const header = (title: string, key: SortKey | null, numeric?: boolean) => (
        <th
            scope='col'
            className={numeric ? 'cmp-table__num' : undefined}
            aria-sort={key && sort === key ? 'descending' : undefined}
        >
            {key ? (
                <button
                    type='button'
                    className={`cmp-table__sort${sort === key ? ' cmp-table__sort--on' : ''}`}
                    onClick={() => setSort(key)}
                >
                    {title}
                </button>
            ) : (
                title
            )}
        </th>
    );
    const extraHeader = (col: RecordColumn<T>, i: number) =>
        header(col.title, col.sort ? `col:${i}` : null, col.numeric);

    return (
        <div className='cmp-scroll'>
            <table className={`cmp-table cmp-table__${label.title.toLocaleLowerCase()}`}>
                <thead>
                    <tr>
                        <th scope='col'>{label.title}</th>
                        {columns.map((col, i) => (
                            <Fragment key={col.title}>{extraHeader(col, i)}</Fragment>
                        ))}
                        {header('Games', 'games', true)}
                        {header('W–L', null, true)}
                        {header('Win rate', 'rate')}
                        {after.map((col, i) => (
                            <Fragment key={col.title}>
                                {extraHeader(col, columns.length + i)}
                            </Fragment>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {sorted.slice(0, shown).map((row) => {
                        const games = gamesOf(row.record);
                        const rate = rateOf(row.record);
                        return (
                            <tr key={rowKey(row)}>
                                <th scope='row'>{label.render(row)}</th>
                                {columns.map((col) => (
                                    <td
                                        key={col.title}
                                        className={col.numeric ? 'cmp-table__num' : undefined}
                                    >
                                        {col.render(row)}
                                    </td>
                                ))}
                                <td className='cmp-table__num'>
                                    {games ? formatNumber(games) : '–'}
                                </td>
                                <td className='cmp-table__num' title={recordTitle(row.record)}>
                                    {games ? formatRecord(row.record) : '–'}
                                </td>
                                <td>
                                    {rate === null ? (
                                        <span className='cmp-table__soft'>–</span>
                                    ) : (
                                        <span className='lb-rate' title={recordTitle(row.record)}>
                                            <span className='lb-rate__value'>
                                                {formatRate(rate)}
                                            </span>
                                            <span className='lb-rate__bar' aria-hidden='true'>
                                                <span style={{ width: `${rate}%` }} />
                                            </span>
                                        </span>
                                    )}
                                </td>
                                {after.map((col) => (
                                    <td
                                        key={col.title}
                                        className={col.numeric ? 'cmp-table__num' : undefined}
                                    >
                                        {col.render(row)}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
            {sorted.length > shown && (
                <button
                    type='button'
                    className='cmp-table__more'
                    onClick={() => setShown(shown + (props.pageSize ?? sorted.length))}
                >
                    Show {Math.min(props.pageSize ?? sorted.length, sorted.length - shown)} more (
                    {formatNumber(sorted.length - shown)} left)
                </button>
            )}
        </div>
    );
}
