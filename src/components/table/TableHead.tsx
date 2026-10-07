import { convertString } from 'str-case-converter';
import type { Category } from './Table';
import { ChevronDownIcon } from '../icons';

interface TableHeadProps {
    categories: Category[];
    disableSorting: boolean;
    handleSort: (category: Category) => void;
    sortConfig: { key: null | string; direction: string };
}

export default function TableHead(props: TableHeadProps) {
    const { categories, disableSorting, handleSort, sortConfig } = props;

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
                    return (
                        <th
                            key={`table-head-${categoryName}`}
                            className='table__head-title'
                            data-category={categoryName}
                            onClick={() => {
                                if (!disableSorting) handleSort(category);
                            }}
                        >
                            <div className='table__table__header-cell-content'>
                                <span>{convertString.toTitle(categoryTitle)}</span>
                                {sortConfig.key === category && (
                                    <ChevronDownIcon
                                        className='table__table__header-cell-icon'
                                        rotate={sortConfig.direction === 'asc' ? true : false}
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
{
    /* <thead>
    <tr>
        {columns.map((column) => (
            <th
                key={column}
                onClick={() => handleSort(column)}
                className='table__table__header-cell'
            >
                <div className='table__table__header-cell-content'>
                    <span>{convertString.toTitle(column)}</span>
                    {sortConfig.key === column && (
                        <ChevronDownIcon
                            className='table__table__header-cell-icon'
                            rotate={sortConfig.direction === 'asc' ? true : false}
                        />
                    )}
                </div>
            </th>
        ))}
    </tr>
</thead>; */
}
