import { ChevronDownIcon } from '@/components/icons';
import type { RecordSortKey, RecordSortState } from '@/types/record';
import { bem, mods } from '@/utils/className';

interface RecordTableHeaderCellProps {
    title: string;
    /** null: not sortable */
    sortKey: RecordSortKey | null;
    sort: RecordSortState;
    numeric?: boolean | undefined;
    className?: string | undefined;
    onSort: (key: RecordSortKey) => void;
}

/** A column header; sortable ones are buttons with an arrow showing the order. */
export default function RecordTableHeaderCell(props: RecordTableHeaderCellProps) {
    const { title, sortKey, sort, numeric, className, onSort } = props;

    const on = sortKey !== null && sort.key === sortKey;
    // what the arrow shows: the label column starts A–Z (up), the others highest first (down)
    const ascending = on && (sortKey === 'label' ? !sort.reversed : sort.reversed);

    return (
        <th
            scope='col'
            className={
                [numeric && 'record-table__num', className].filter(Boolean).join(' ') || undefined
            }
            aria-sort={on ? (ascending ? 'ascending' : 'descending') : undefined}
        >
            {sortKey ? (
                <button
                    type='button'
                    className={bem('record-table__sort', on && 'on')}
                    onClick={() => onSort(sortKey)}
                    title={on ? 'Reverse the order' : `Sort by ${title.toLowerCase()}`}
                >
                    {title}
                    <ChevronDownIcon
                        key={on ? 'on' : 'off'}
                        className={mods('record-table__sort-icon', !on && 'off')}
                        width={10}
                        height={10}
                        rotate={ascending}
                    />
                </button>
            ) : (
                title
            )}
        </th>
    );
}
