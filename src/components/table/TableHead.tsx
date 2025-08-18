import { convertString } from 'str-case-converter';
import type { Category } from './Table';

interface TableHeadProps {
    categories: Category[];
}

export default function TableHead(props: TableHeadProps) {
    const { categories } = props;

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
                            key={`table-head-${category}`}
                            className='table__head-title'
                            data-category={categoryName}
                        >
                            {categoryTitle}
                        </th>
                    );
                })}
            </tr>
        </thead>
    );
}
