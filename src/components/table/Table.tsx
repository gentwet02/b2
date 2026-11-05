import { useMemo, useState, type ReactNode } from 'react';
import { convertString } from 'str-case-converter';
import { TABLE_DEFAULT_PAGE_SIZE, TABLE_PAGE_SIZES } from '@/config/table';
import type {
    Category,
    Row,
    TableSort,
    TableState,
    TableStateCause,
    TableStateInput,
} from '@/types/table';
import { categoryKey, nodeText, sortValue } from '@/utils/table';
import TableBody from './TableBody';
import TableHead from './TableHead';
import TablePageSizeSelector from './TablePageSizeSelector';
import TablePagination from './TablePagination';
import TableSearch from './TableSearch';

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
    sort?: { key: string; direction: 'asc' | 'desc' } | null | undefined;
    onSort?: ((key: string) => void) | undefined;
    sortable?: string[] | undefined;
    controls?: ReactNode;
    /** whether row `index` matches the lowercased search; default: any cell's text contains it */
    searchMatch?: ((index: number, term: string) => boolean) | undefined;
    state?: TableStateInput | undefined;
    onStateChange?: ((next: TableState, cause: TableStateCause) => void) | undefined;
}

export default function Table(props: TableProps) {
    const {
        categories,
        data = [],
        name = '',
        itemsPerPage = TABLE_DEFAULT_PAGE_SIZE,
        pageSizeOptions = TABLE_PAGE_SIZES,
        searchAriaLabel = 'Search table entries',
        searchPlaceHolder = 'Search...',
        disableSearch = false,
        disablePageSize = false,
        disableSorting = false,
        searchMatch,
        state,
        onStateChange,
        sort,
        onSort,
        sortable,
        controls,
    } = props;

    const [sortConfig, setSortConfig] = useState<TableSort>({ key: null, direction: 'asc' });
    const [ownSearch, setOwnSearch] = useState('');
    const [ownPage, setOwnPage] = useState(1);
    const [ownPageSize, setOwnPageSize] = useState(itemsPerPage);

    const controlled = !!onStateChange;
    const searchTerm = controlled ? (state?.search ?? '') : ownSearch;
    const currentPage = controlled ? (state?.page ?? 1) : ownPage;
    const pageSize = controlled ? (state?.pageSize ?? itemsPerPage) : ownPageSize;

    function update(patch: Partial<TableState>, cause: TableStateCause) {
        const next = { page: currentPage, pageSize, search: searchTerm, ...patch };
        if (onStateChange) {
            onStateChange(next, cause);
        } else {
            setOwnSearch(next.search);
            setOwnPage(next.page);
            setOwnPageSize(next.pageSize);
        }
    }

    const columns: Category[] = categories || Object.keys(data[0] || {});

    const filteredAndSortedData = useMemo(() => {
        const term = searchTerm.trim().toLowerCase();
        const processedData = term
            ? data.filter(
                  (item, i) =>
                      searchMatch
                          ? searchMatch(i, term)
                          : Object.values(item)
                                .map(nodeText)
                                .join(' ')
                                .toLowerCase()
                                .includes(term),
              )
            : [...data];

        const key = onSort ? null : sortConfig.key;
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
    }, [data, searchMatch, searchTerm, sortConfig, onSort]);

    const totalPages = Math.max(1, Math.ceil(filteredAndSortedData.length / pageSize));
    // keep the page in range when the data shrinks (search, page size, refetch)
    const page = Math.min(Math.max(1, currentPage), totalPages);

    function handleSort(category: Category) {
        const key = categoryKey(category);
        if (onSort) {
            if (!sortable || sortable.includes(key)) onSort(key);
            return;
        }
        setSortConfig((previous) => ({
            key,
            direction: previous.key === key && previous.direction === 'asc' ? 'desc' : 'asc',
        }));
    }

    const handleSearch = (value: string) => update({ search: value, page: 1 }, 'search');

    const handlePageSize = (value: number) => update({ pageSize: value, page: 1 }, 'pageSize');

    const handlePage = (value: number | ((previous: number) => number)) =>
        update({ page: typeof value === 'function' ? value(page) : value }, 'page');

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
                    {(controls || !disablePageSize) && (
                        <div className='table__controls-end'>
                            {controls}
                            {!disablePageSize && (
                                <TablePageSizeSelector
                                    pageSize={pageSize}
                                    onPageSizeChange={handlePageSize}
                                    pageSizeOptions={pageSizeOptions}
                                />
                            )}
                        </div>
                    )}
                </div>
            )}
            <div className='table__scroll'>
                <table className='table__table'>
                    <TableHead
                        categories={columns}
                        handleSort={handleSort}
                        sortConfig={onSort ? (sort ?? { key: null, direction: 'asc' }) : sortConfig}
                        disableSorting={disableSorting}
                        isSortable={(key) =>
                            onSort ? !sortable || sortable.includes(key) : !disableSorting
                        }
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
                    onPageChange={handlePage}
                />
            )}
        </div>
    );
}
