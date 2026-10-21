import { ChevronDownIcon } from '@/components/icons';
import type { Wld } from '@/types/compare';
import { formatRate, formatRecord, gamesOf, rateOf, recordTitle } from '@/utils/compare';
import { formatNumber } from '@/utils/format';
import { Fragment, useState, type ReactNode } from 'react';

export interface RecordColumn<T> {
    title: string;
    render: (row: T) => ReactNode;
    /** the column's first order (the header becomes a sort button; a second click reverses it) */
    sort?: (a: T, b: T) => number;
    numeric?: boolean;
}

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
    pageSize?: number;
}

type SortKey = 'games' | 'rate' | 'none' | 'label' | `col:${number}`;
interface SortState {
    key: SortKey;
    /** reversed: the opposite of the column's first order */
    reversed: boolean;
}

const byGames = (a: { record: Wld }, b: { record: Wld }) => gamesOf(b.record) - gamesOf(a.record);
const byRate = (a: { record: Wld }, b: { record: Wld }) =>
    (rateOf(b.record) ?? -1) - (rateOf(a.record) ?? -1) || byGames(a, b);

/** Rows with a record: games, W–D–L, win rate; sortable both ways, sticky head and first column. */
export default function RecordTable<T extends { record: Wld }>(props: RecordTableProps<T>) {
    const { rows, rowKey, label, columns = [], after = [], empty } = props;
    const [sort, setSort] = useState<SortState>({
        key: props.initialSort ?? 'games',
        reversed: false,
    });
    const [shown, setShown] = useState(props.pageSize ?? Infinity);

    const extra = [...columns, ...after];
    const compare: ((a: T, b: T) => number) | undefined =
        sort.key === 'games'
            ? byGames
            : sort.key === 'rate'
              ? byRate
              : sort.key === 'label'
                ? label.sort
                : sort.key === 'none'
                  ? undefined
                  : extra[Number(sort.key.slice(4))]?.sort;
    const sorted = [...rows];
    if (compare) {
        const dir = sort.reversed ? -1 : 1;
        sorted.sort((a, b) => {
            // no win rate (draws only): always last
            if (sort.key === 'rate') {
                const none = Number(rateOf(a.record) === null) - Number(rateOf(b.record) === null);
                if (none) return none;
            }
            return dir * compare(a, b) || byGames(a, b);
        });
    }

    if (rows.length === 0) return <p className='profile-panel__empty'>{empty ?? 'Nothing yet.'}</p>;

    const anyDraw = rows.some((r) => r.record[2] > 0);
    const click = (key: SortKey) =>
        setSort((prev) => ({ key, reversed: prev.key === key ? !prev.reversed : false }));

    const header = (title: string, key: SortKey | null, numeric?: boolean) => {
        const on = key !== null && sort.key === key;
        // what the arrow shows: the label column starts A–Z (up), the others highest first (down)
        const ascending = on && (key === 'label' ? !sort.reversed : sort.reversed);
        return (
            <th
                scope='col'
                className={numeric ? 'cmp-table__num' : undefined}
                aria-sort={on ? (ascending ? 'ascending' : 'descending') : undefined}
            >
                {key ? (
                    <button
                        type='button'
                        className={`cmp-table__sort${on ? ' cmp-table__sort--on' : ''}`}
                        onClick={() => click(key)}
                        title={on ? 'Reverse the order' : `Sort by ${title.toLowerCase()}`}
                    >
                        {title}
                        {on && (
                            <ChevronDownIcon
                                className='cmp-table__sort-icon'
                                width={10}
                                height={10}
                                rotate={ascending}
                            />
                        )}
                    </button>
                ) : (
                    title
                )}
            </th>
        );
    };
    const extraHeader = (col: RecordColumn<T>, i: number) =>
        header(col.title, col.sort ? `col:${i}` : null, col.numeric);

    return (
        <div className='cmp-scroll'>
            <table className={`cmp-table cmp-table__${label.title.toLocaleLowerCase()}`}>
                <thead>
                    <tr>
                        {header(label.title, label.sort ? 'label' : null)}
                        {columns.map((col, i) => (
                            <Fragment key={col.title}>{extraHeader(col, i)}</Fragment>
                        ))}
                        {header('Games', 'games', true)}
                        {header(anyDraw ? 'W–D–L' : 'W–L', null, true)}
                        {header('Win rate', 'rate')}
                        {after.map((col, i) => (
                            <Fragment key={col.title || `after-${i}`}>
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
                                {after.map((col, i) => (
                                    <td
                                        key={col.title || `after-${i}`}
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
