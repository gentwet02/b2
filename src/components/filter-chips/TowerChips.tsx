import ChipAdder from '@/components/filter-chips/ChipAdder';
import ChipClear from '@/components/filter-chips/ChipClear';
import FilterChip from '@/components/filter-chips/FilterChip';
import type { ChipExclusion } from '@/types/filter';
import type { SideFilterOptions } from '@/types/match';
import { formatLabel, formatNumber } from '@/utils/format';

interface TowerChipsProps {
    towers: string[];
    max: number;
    options?: SideFilterOptions | undefined;
    onChange: (next: string[]) => void;
    /** towers nobody uses (no exclude select without it) */
    exclude?: ChipExclusion<string> | undefined;
    /** empties the picks and the exclusions in one change (shown from 2 chips) */
    onClear?: (() => void) | undefined;
}

/** The selects on one line, the picked and excluded towers below. */
export default function TowerChips(props: TowerChipsProps) {
    const { towers, max, options, onChange, exclude, onClear } = props;
    const excluded = exclude?.items ?? [];

    // a tower is either included or excluded, never both
    const addOptions = (options?.towers ?? [])
        .filter((t) => t.count > 0 && !towers.includes(t.tower) && !excluded.includes(t.tower))
        .map((t) => ({
            value: t.tower,
            label: `${formatLabel(t.tower)} (${formatNumber(t.count)})`,
        }));

    const canAdd = towers.length < max;
    const canExclude = !!exclude && excluded.length < exclude.max && addOptions.length > 0;
    const canClear = !!onClear && towers.length + excluded.length >= 2;
    const hasChips = towers.length > 0 || excluded.length > 0;

    return (
        <div className='filter-chips'>
            {(canAdd || canExclude || canClear) && (
                <div className='filter-chips__selectors'>
                    {canAdd && (
                        <ChipAdder
                            aria-label='Add a tower'
                            placeholder='+ Add tower'
                            options={addOptions}
                            onAdd={(tower) => onChange([...towers, tower])}
                        />
                    )}
                    {exclude && canExclude && (
                        <ChipAdder
                            excluding
                            aria-label='Exclude a tower'
                            placeholder='− Exclude tower'
                            options={addOptions}
                            onAdd={(tower) => exclude.onChange([...excluded, tower])}
                        />
                    )}
                    {onClear && canClear && <ChipClear what='towers' onClear={onClear} />}
                </div>
            )}
            {hasChips && (
                <ul className='filter-chips__list'>
                    {towers.map((tower) => (
                        <FilterChip
                            key={tower}
                            name={formatLabel(tower)}
                            onRemove={() => onChange(towers.filter((t) => t !== tower))}
                        />
                    ))}
                    {exclude &&
                        excluded.map((tower) => (
                            <FilterChip
                                key={`not-${tower}`}
                                name={formatLabel(tower)}
                                excluded
                                onRemove={() =>
                                    exclude.onChange(excluded.filter((t) => t !== tower))
                                }
                            />
                        ))}
                </ul>
            )}
        </div>
    );
}
