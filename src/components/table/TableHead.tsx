import { convertString } from 'str-case-converter';
import { ChevronDownIcon } from '@/components/icons';
import type { Category, TableSort } from '@/types/table';

interface TableHeadProps {
    categories: Category[];
    disableSorting: boolean;
    handleSort: (category: Category) => void;
    sortConfig: TableSort;
    isSortable?: (key: string) => boolean;
}

export default function TableHead(props: TableHeadProps) {
    const { categories, disableSorting, handleSort, sortConfig, isSortable } = props;

    return (
        <thead className='table__head'>
            <tr className='table__head-row'>
                {categories.map((category) => {
                    const categoryName =
                        typeof category === 'string'
                            ? convertString.toKebab(category)
                            : category.name;
                    const categoryTitle =
                        typeof category === 'string'
                            ? convertString.toTitle(category)
                            : category.title;
                    const key = typeof category === 'string' ? category : category.name;
                    const sortable = isSortable ? isSortable(key) : !disableSorting;
                    const active = sortConfig.key === key;
                    return (
                        <th
                            key={`table-head-${categoryName}`}
                            className={`table__head-title${sortable ? ' table__head-title--sortable' : ''}`}
                            data-category={categoryName}
                            aria-sort={
                                active
                                    ? sortConfig.direction === 'asc'
                                        ? 'ascending'
                                        : 'descending'
                                    : undefined
                            }
                            title={
                                sortable
                                    ? active
                                        ? 'Click to reverse the order'
                                        : 'Click to sort'
                                    : undefined
                            }
                            onClick={() => {
                                if (sortable) handleSort(category);
                            }}
                        >
                            <div className='table__table__header-cell-content'>
                                <span>{convertString.toTitle(categoryTitle)}</span>
                                {sortable && (
                                    <ChevronDownIcon
                                        key={active ? 'on' : 'off'}
                                        className={`table__table__header-cell-icon${active ? '' : ' table__table__header-cell-icon--off'}`}
                                        rotate={active && sortConfig.direction === 'asc'}
                                    />
                                )}
                            </div>
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
}
