import ChipAdder from '@/components/filter-chips/ChipAdder';
import FilterChip from '@/components/filter-chips/FilterChip';
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
        <div className='filter-chips'>
            {towers.map((tower) => (
                <FilterChip
                    key={tower}
                    name={formatLabel(tower)}
                    onRemove={() => onChange(towers.filter((t) => t !== tower))}
                />
            ))}
            {towers.length < max && (
                <ChipAdder
                    aria-label='Add a tower'
                    placeholder='+ Add tower'
                    options={addOptions}
                    onAdd={(tower) => onChange([...towers, tower])}
                />
            )}
        </div>
    );
}
