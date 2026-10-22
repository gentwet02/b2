import Dropdown from '@/components/dropdown/Dropdown';
import ChipAdder from '@/components/filter-chips/ChipAdder';
import FilterChip from '@/components/filter-chips/FilterChip';
import type { MapChipOption, MapVariant } from '@/types/map';
import { mapImage } from '@/utils/assetOverrides';
import { formatNumber } from '@/utils/format';
import { formatMap } from '@/utils/map';

interface MapChipProps {
    /** "oasis" (both versions), "oasis:classic" or "oasis:reversed" */
    value: string | undefined;
    options: MapChipOption[];
    onChange: (next: string | undefined) => void;
    placeholder?: string;
}

/** One map, both versions or only its classic / reversed one, styled like the hero chip. */
export default function MapChip(props: MapChipProps) {
    const { value, options, onChange, placeholder = '+ Pick map' } = props;

    const [base = '', variant] = (value ?? '').split(':');
    const option = options.find((m) => m.key === base);

    if (!value) {
        const addOptions = options
            .filter((m) => m.count > 0)
            .map((m) => ({ value: m.key, label: `${formatMap(m.map)} (${formatNumber(m.count)})` }))
            .sort((a, b) => a.label.localeCompare(b.label));
        return (
            <div className='filter-chips'>
                <ChipAdder
                    aria-label='Pick a map'
                    placeholder={placeholder}
                    options={addOptions}
                    searchable
                    onAdd={onChange}
                />
            </div>
        );
    }

    const name = formatMap(option?.map ?? base);
    const countOf = (v: MapVariant) => option?.variants.find((x) => x.variant === v)?.count ?? 0;
    const hasReversed = countOf('reversed') > 0 || variant === 'reversed';
    const variantOptions = [
        {
            value: '',
            label: `Both versions${option ? ` (${formatNumber(option.count)})` : ''}`,
        },
        { value: 'classic', label: `Classic (${formatNumber(countOf('classic'))})` },
        { value: 'reversed', label: `Reversed (${formatNumber(countOf('reversed'))})` },
    ];

    return (
        <div className='filter-chips'>
            <FilterChip
                name={name}
                image={{ src: mapImage(option?.map, option?.image ?? undefined), kind: 'map' }}
                onRemove={() => onChange(undefined)}
            >
                {hasReversed && (
                    <Dropdown
                        className='filter-chip__variant'
                        aria-label={`${name} version`}
                        variant='pill'
                        options={variantOptions}
                        value={variant ?? ''}
                        onSelect={(next) => onChange(next ? `${base}:${next}` : base)}
                    />
                )}
            </FilterChip>
        </div>
    );
}
