import Dropdown from '@/components/dropdown/Dropdown';
import type { SideFilterOptions } from '@/types/match';
import { formatLabel, formatNumber } from '@/utils/format';

interface TowerChipsProps {
    towers: string[];
    max: number;
    options?: SideFilterOptions | undefined;
    onChange: (next: string[]) => void;
}

export default function TowerChips(props: TowerChipsProps) {
    const { towers, max, options, onChange } = props;

    const addOptions = (options?.towers ?? [])
        .filter((t) => t.count > 0 && !towers.includes(t.tower))
        .map((t) => ({
            value: t.tower,
            label: `${formatLabel(t.tower)} (${formatNumber(t.count)})`,
        }));

    return (
        <div className='match-filters__chips'>
            {towers.map((tower) => (
                <span key={tower} className='chip-filter'>
                    <span className='chip-filter__name'>{formatLabel(tower)}</span>
                    <button
                        type='button'
                        className='chip-filter__remove'
                        aria-label={`Remove ${formatLabel(tower)}`}
                        onClick={() => onChange(towers.filter((t) => t !== tower))}
                    >
                        ×
                    </button>
                </span>
            ))}
            {towers.length < max && (
                <Dropdown
                    className='match-filters__add'
                    aria-label='Add a tower'
                    placeholder='+ Add tower'
                    options={addOptions}
                    value=''
                    onSelect={(tower) => onChange([...towers, tower])}
                />
            )}
        </div>
    );
}
