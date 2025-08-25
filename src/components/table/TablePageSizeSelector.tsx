interface TablePageSizeSelectorProps {
    pageSize: number;
    onPageSizeChange: (value: number) => void;
    pageSizeOptions: number[];
}

export default function TablePageSizeSelector(props: TablePageSizeSelectorProps) {
    const { pageSize, onPageSizeChange, pageSizeOptions } = props;
    return (
        <div className='table__page-size'>
            <label className='table__page-size-label'>
                Shows{' '}
                <select
                    name='size-select'
                    className='table__page-size-select'
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                >
                    {pageSizeOptions.map((size) => (
                        <option key={size} value={size}>
                            {size}
                        </option>
                    ))}
                </select>{' '}
                entries
            </label>
        </div>
    );
}
