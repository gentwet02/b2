import { SearchIcon } from '@/components/icons';

interface PlayerSearchProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder: string;
}

export default function PlayerSearch(props: PlayerSearchProps) {
    const { label, value, placeholder, onChange } = props;

    return (
        <label className='match-filters__search'>
            <span className='visually-hidden'>{label}</span>
            <SearchIcon className='match-filters__search-icon' aria-hidden='true' />
            <input
                type='search'
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        </label>
    );
}
