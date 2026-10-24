import { SearchIcon } from '@/components/icons';

interface PlayerSearchProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    placeholder: string;
    visibleLabel?: boolean;
}

export default function PlayerSearch(props: PlayerSearchProps) {
    const { label, value, placeholder, visibleLabel, onChange } = props;

    return (
        <label className='match-filters__search'>
            <span className={visibleLabel ? 'match-filters__label' : 'visually-hidden'}>
                {label}
            </span>
            <span className='match-filters__search-box'>
                <SearchIcon className='match-filters__search-icon' aria-hidden='true' />
                <input
                    type='search'
                    value={value}
                    placeholder={placeholder}
                    onChange={(e) => onChange(e.target.value)}
                />
            </span>
        </label>
    );
}
