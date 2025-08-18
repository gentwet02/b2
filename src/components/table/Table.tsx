import type { ReactNode } from 'react';
import TableBody from './TableBody';
import TableHead from './TableHead';

export type Category = string | { name: string; title: string };

export interface Row {
    [key: string]: ReactNode;
}

interface TableProps {
    categories?: Category[];
    data: Row[];
}

export default function Table(props: TableProps) {
    const { categories, data } = props;
    let columns = categories;

    if (!data[0]) {
        return <></>;
    }

    if (!columns) {
        columns = Object.keys(data[0]);
    }

    return (
        <div className='table__container'>
            <table className='table'>
                <TableHead categories={columns} />
                <TableBody data={data} />
            </table>
        </div>
    );
}
