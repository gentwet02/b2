import type { Category, Row } from './Table';

interface TableBodyProps {
    categories: Category[];
    data: Row[];
}

export default function TableBody(props: TableBodyProps) {
    const { categories, data } = props;

    return (
        <tbody>
            {data.length > 0 ? (
                data.map((row, index) => (
                    <tr key={`table-row-${index}`} className='table__row'>
                        {Object.keys(row).map((key, index) => (
                            <td key={`table-row-cell-${index}`} className='table__cell'>
                                {row[key]}
                            </td>
                        ))}
                    </tr>
                ))
            ) : (
                <tr>
                    <td colSpan={categories.length} className='table__empty'>
                        <div className='table__empty-message'>No results found</div>
                    </td>
                </tr>
            )}
        </tbody>
    );
}
