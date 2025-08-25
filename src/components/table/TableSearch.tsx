import { SearchIcon } from '@/components/icons';
import { convertString } from 'str-case-converter';

interface TableSearchProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    name?: string;
    searchAriaLabel: string;
    searchPlaceHolder: string;
}

export default function TableSearch(props: TableSearchProps) {
    const { searchTerm, onSearchChange, name = '', searchAriaLabel, searchPlaceHolder } = props;

    const kebabName = `${convertString.toKebab(name)}-table-search`;
    return (
        <div className='table__search'>
            <input
                {...(kebabName ? { id: kebabName } : {})}
                name={kebabName || 'table-search'}
                className='table__search-input'
                aria-label={searchAriaLabel}
                type='text'
                placeholder={searchPlaceHolder}
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
            />
            <SearchIcon className='table__search-icon' />
        </div>
    );
}
