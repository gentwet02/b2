import Dropdown from '@/components/dropdown/Dropdown';

interface TablePageSizeSelectorProps {
    pageSize: number;
    onPageSizeChange: (value: number) => void;
    pageSizeOptions: number[];
}

export default function TablePageSizeSelector(props: TablePageSizeSelectorProps) {
    const { pageSize, onPageSizeChange, pageSizeOptions } = props;

    return (
        <label className='table__page-size'>
            <span className='table__page-size-label'>Entries</span>
            <Dropdown
                id='size-select'
                className='table__page-size-select'
                aria-label='Entries per page'
                variant='compact'
                options={pageSizeOptions}
                value={pageSize}
                onSelect={onPageSizeChange}
            />
        </label>
    );
}
