import Dropdown from '@/components/dropdown/Dropdown';
import { mapImage } from '@/utils/assetOverrides';
import { formatNumber } from '@/utils/format';
import type { MapChipOption, MapVariant } from '@/types/map';
import { formatMap } from '@/utils/map';
import FilterChip from './FilterChip';

interface MapFilterChipProps {
    value: string;
    options: MapChipOption[];
    excluded?: boolean;
    onChange: (next: string) => void;
    onRemove: () => void;
}

/** A picked (or excluded) map, with its version select when it has a reversed one. */
export default function MapFilterChip(props: MapFilterChipProps) {
    const { value, options, excluded, onChange, onRemove } = props;

    const [base = '', variant] = value.split(':');
    const option = options.find((m) => m.key === base);
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
        <FilterChip
            name={name}
            image={{ src: mapImage(option?.map, option?.image ?? undefined), kind: 'map' }}
            excluded={excluded}
            onRemove={onRemove}
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
    );
}
