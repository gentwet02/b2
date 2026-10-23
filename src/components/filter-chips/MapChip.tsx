import ChipAdder from '@/components/filter-chips/ChipAdder';
import ChipClear from '@/components/filter-chips/ChipClear';
import type { ChipExclusion } from '@/types/filter';
import type { MapChipOption } from '@/types/map';
import { formatNumber } from '@/utils/format';
import { formatMap } from '@/utils/map';
import MapFilterChip from './MapFilterChip';

interface MapChipProps {
    /** "oasis" (both versions), "oasis:classic" or "oasis:reversed" */
    value: string | undefined;
    options: MapChipOption[];
    onChange: (next: string | undefined) => void;
    placeholder?: string;
    /** maps left out, keys like `value` (no exclude select without it) */
    exclude?: ChipExclusion<string> | undefined;
    /** empties the picks and the exclusions in one change (shown from 2 chips) */
    onClear?: (() => void) | undefined;
}

const baseOf = (value: string) => value.split(':')[0] ?? '';

/** One map, both versions or only its classic / reversed one, or maps left out. */
export default function MapChip(props: MapChipProps) {
    const { value, options, onChange, placeholder = '+ Pick map', exclude, onClear } = props;
    const excluded = exclude?.items ?? [];

    // a map is either picked or excluded, never both
    const taken = (key: string) =>
        baseOf(value ?? '') === key || excluded.some((m) => baseOf(m) === key);
    const addOptions = options
        .filter((m) => m.count > 0 && !taken(m.key))
        .map((m) => ({ value: m.key, label: `${formatMap(m.map)} (${formatNumber(m.count)})` }))
        .sort((a, b) => a.label.localeCompare(b.label));

    // one map picked: leaving others out changes nothing, so exclusions are hidden
    const showExcluded = !value && !!exclude;
    const canExclude = showExcluded && excluded.length < exclude.max && addOptions.length > 0;
    const hasChips = !!value || (showExcluded && excluded.length > 0);
    // chips on screen: the picked map, or the excluded ones
    const canClear = !!onClear && (value ? 1 : 0) + (showExcluded ? excluded.length : 0) >= 2;

    return (
        <div className='filter-chips'>
            {(!value || canExclude || canClear) && (
                <div className='filter-chips__selectors'>
                    {!value && (
                        <ChipAdder
                            aria-label='Pick a map'
                            placeholder={placeholder}
                            options={addOptions}
                            searchable
                            onAdd={onChange}
                        />
                    )}
                    {exclude && canExclude && (
                        <ChipAdder
                            excluding
                            aria-label='Exclude a map'
                            placeholder='− Exclude map'
                            options={addOptions}
                            searchable
                            onAdd={(map) => exclude.onChange([...excluded, map])}
                        />
                    )}
                    {onClear && canClear && <ChipClear what='maps' onClear={onClear} />}
                </div>
            )}
            {hasChips && (
                <ul className='filter-chips__list'>
                    {value && (
                        <MapFilterChip
                            value={value}
                            options={options}
                            onChange={onChange}
                            onRemove={() => onChange(undefined)}
                        />
                    )}
                    {exclude &&
                        showExcluded &&
                        excluded.map((map, i) => (
                            <MapFilterChip
                                key={`not-${baseOf(map)}`}
                                value={map}
                                options={options}
                                excluded
                                onChange={(next) =>
                                    exclude.onChange(excluded.map((m, j) => (j === i ? next : m)))
                                }
                                onRemove={() =>
                                    exclude.onChange(excluded.filter((_, j) => j !== i))
                                }
                            />
                        ))}
                </ul>
            )}
        </div>
    );
}
