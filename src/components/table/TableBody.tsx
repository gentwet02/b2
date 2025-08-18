import type { Row } from './Table';

interface TableBodyProps {
    data: Row[];
}

export default function TableBody(props: TableBodyProps) {
    const { data } = props;

    return (
        <tbody>
            {data.map((row, index) => (
                <tr key={`table-row-${index}`} className='table__row'>
                    {Object.keys(row).map((key, index) => (
                        <td key={`table-row-cell-${index}`} className='table__cell'>
                            {row[key]}
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
}
