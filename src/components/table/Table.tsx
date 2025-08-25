import { useEffect, useMemo, useState, type ReactNode } from 'react';
import TableBody from './TableBody';
import TableHead from './TableHead';
import { convertString } from 'str-case-converter';
import TablePageSizeSelector from './TablePageSizeSelector';
import TablePagination from './TablePagination';
import TableSearch from './TableSearch';

export type Category = string | { name: string; title: string };

export interface Row {
    [key: string]: ReactNode;
}

interface TableProps {
    categories?: Category[];
    data?: Row[];
    name?: string;
    itemsPerPage?: number;
    pageSizeOptions?: number[];
    searchAriaLabel?: string;
    searchPlaceHolder?: string;
    disableSearch?: boolean;
    disablePageSize?: boolean;
    disableSorting?: boolean;
}

export default function Table(props: TableProps) {
    const {
        categories,
        data = [],
        name = '',
        itemsPerPage = 10,
        pageSizeOptions = [5, 10, 25, 50],
        searchAriaLabel = 'Search table entries',
        searchPlaceHolder = 'Search...',
        disableSearch = false,
        disablePageSize = false,
        disableSorting = false,
    } = props;

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(itemsPerPage);
    const columns = categories || Object.keys(data[0] || {});

    const filteredAndSortedData = useMemo(() => {
        let processedData = [...data];

        if (searchTerm) {
            processedData = processedData.filter((item) =>
                Object.values(item).some((value) =>
                    String(value).toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        if (sortConfig.key) {
            processedData.sort((a, b) => {
                if (a[sortConfig.key] < b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? -1 : 1;
                }
                if (a[sortConfig.key] > b[sortConfig.key]) {
                    return sortConfig.direction === 'asc' ? 1 : -1;
                }
                return 0;
            });
        }

        return processedData;
    }, [data, searchTerm, sortConfig]);

    useEffect(() => {
        if (currentPage > 1 && filteredAndSortedData.length <= (currentPage - 1) * pageSize) {
            setCurrentPage(currentPage - 1);
        }
    }, [filteredAndSortedData, currentPage, pageSize]);

    const handleSort = (column) => {
        let direction = 'asc';
        if (sortConfig.key === column && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key: column, direction });
    };

    const totalPages = Math.ceil(filteredAndSortedData.length / pageSize);
    const paginatedData = filteredAndSortedData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div
            className={`table table__container${name && ` ${convertString.toKebab(name)}__table`}`}
        >
            <div className='table__controls'>
                {!disableSearch && (
                    <TableSearch
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        name={name}
                        searchAriaLabel={searchAriaLabel}
                        searchPlaceHolder={searchPlaceHolder}
                    />
                )}
                {!disablePageSize && (
                    <TablePageSizeSelector
                        pageSize={pageSize}
                        onPageSizeChange={setPageSize}
                        pageSizeOptions={pageSizeOptions}
                    />
                )}
            </div>
            <table className='table__table'>
                <TableHead
                    categories={columns}
                    handleSort={handleSort}
                    sortConfig={sortConfig}
                    disableSorting={disableSorting}
                />
                <TableBody categories={columns} data={paginatedData} />
            </table>
            <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={pageSize}
                totalItems={filteredAndSortedData.length}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}
