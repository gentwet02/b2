interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    itemsPerPage: number;
    totalItems: number;
    onPageChange: (value: number | ((prevState: number) => number)) => void;
}

export default function TablePagination(props: TablePaginationProps) {
    const { currentPage, totalPages, itemsPerPage, totalItems, onPageChange } = props;

    return (
        <div className='table__pagination'>
            <div className='table__pagination-info'>
                Showing{' '}
                {totalPages > 1 && (
                    <>
                        {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(currentPage * itemsPerPage, totalItems)} of
                    </>
                )}{' '}
                {totalItems} results
            </div>
            <div className='table__pagination-controls'>
                <button
                    onClick={() => onPageChange((prev) => Math.max(+prev - 1, 1))}
                    disabled={currentPage === 1}
                    className='table__pagination-button'
                >
                    Previous
                </button>
                <button
                    onClick={() => onPageChange((prev) => Math.min(+prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className='table__pagination-button'
                >
                    Next
                </button>
            </div>
        </div>
    );
}
