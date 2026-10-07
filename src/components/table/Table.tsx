import { isValidElement, useMemo, useState, type ReactNode } from 'react';
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

type SortConfig = { key: string | null; direction: 'asc' | 'desc' };

/** Visible text of a cell, so search also matches cells holding links or badges. */
function nodeText(node: ReactNode): string {
    if (node === null || node === undefined || typeof node === 'boolean') return '';
    if (typeof node === 'string' || typeof node === 'number') return String(node);
    if (Array.isArray(node)) return node.map(nodeText).join(' ');
    if (isValidElement<{ children?: ReactNode }>(node)) return nodeText(node.props.children);
    return '';
}

function sortValue(node: ReactNode): string | number {
    if (typeof node === 'number') return node;
    const text = nodeText(node);
    const asNumber = Number(text.replace(/[\s,]/g, ''));
    return text !== '' && Number.isFinite(asNumber) ? asNumber : text.toLowerCase();
}

const categoryKey = (category: Category) =>
    typeof category === 'string' ? category : category.name;

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

    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(itemsPerPage);
    const columns: Category[] = categories || Object.keys(data[0] || {});

    const filteredAndSortedData = useMemo(() => {
        let processedData = [...data];
        const term = searchTerm.trim().toLowerCase();

        if (term) {
            processedData = processedData.filter((item) =>
                Object.values(item).some((value) => nodeText(value).toLowerCase().includes(term)),
            );
        }

        const key = sortConfig.key;
        if (key) {
            const factor = sortConfig.direction === 'asc' ? 1 : -1;
            processedData.sort((a, b) => {
                const left = sortValue(a[key]);
                const right = sortValue(b[key]);
                if (left < right) return -factor;
                if (left > right) return factor;
                return 0;
            });
        }

        return processedData;
    }, [data, searchTerm, sortConfig]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / pageSize));
    // keep the page in range when the data shrinks (search, page size, refetch)
    const page = Math.min(currentPage, totalPages);

    const handleSort = (category: Category) => {
        const key = categoryKey(category);
        setSortConfig((previous) => ({
            key,
            direction: previous.key === key && previous.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    const handleSearch = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePageSize = (value: number) => {
        setPageSize(value);
        setCurrentPage(1);
    };

    const paginatedData = filteredAndSortedData.slice((page - 1) * pageSize, page * pageSize);

    return (
        <div
            className={`table table__container${name && ` ${convertString.toKebab(name)}__table`}`}
        >
            {(!disableSearch || !disablePageSize) && (
                <div className='table__controls'>
                    {!disableSearch && (
                        <TableSearch
                            searchTerm={searchTerm}
                            onSearchChange={handleSearch}
                            name={name}
                            searchAriaLabel={searchAriaLabel}
                            searchPlaceHolder={searchPlaceHolder}
                        />
                    )}
                    {!disablePageSize && (
                        <TablePageSizeSelector
                            pageSize={pageSize}
                            onPageSizeChange={handlePageSize}
                            pageSizeOptions={pageSizeOptions}
                        />
                    )}
                </div>
            )}
            <div className='table__scroll'>
                <table className='table__table'>
                    <TableHead
                        categories={columns}
                        handleSort={handleSort}
                        sortConfig={sortConfig}
                        disableSorting={disableSorting}
                    />
                    <TableBody categories={columns} data={paginatedData} />
                </table>
            </div>
            {totalPages > 1 && (
                <TablePagination
                    currentPage={page}
                    totalPages={totalPages}
                    itemsPerPage={pageSize}
                    totalItems={filteredAndSortedData.length}
                    onPageChange={setCurrentPage}
                />
            )}
        </div>
    );
}
