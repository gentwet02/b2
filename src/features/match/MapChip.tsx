import Dropdown from '@/components/dropdown/Dropdown';
import type { MapVariant } from '@/types/map';
import { mapImage } from '@/utils/assetOverrides';
import { formatMap, formatNumber } from '@/utils/format';

export interface MapChipOption {
    /** base map key: classic and reversed versions together */
    key: string;
    /** a raw NK id, for the name and the image override */
    map: string;
    image?: string | null | undefined;
    count: number;
    variants: { variant: MapVariant; count: number }[];
}

interface MapChipProps {
    /** "oasis" (both versions), "oasis:classic" or "oasis:reversed" */
    value: string | undefined;
    options: MapChipOption[];
    onChange: (next: string | undefined) => void;
    placeholder?: string;
}

/** One map, both versions or only its classic / reversed one, styled like the hero chip. */
export default function MapChip(props: MapChipProps) {
    const { value, options, onChange, placeholder } = props;

    const [base = '', variant] = (value ?? '').split(':');
    const option = options.find((m) => m.key === base);

    if (!value) {
        const addOptions = options
            .filter((m) => m.count > 0)
            .map((m) => ({ value: m.key, label: `${formatMap(m.map)} (${formatNumber(m.count)})` }))
            .sort((a, b) => a.label.localeCompare(b.label));
        return (
            <div className='match-filters__chips'>
                <Dropdown
                    className='match-filters__add'
                    aria-label='Pick a map'
                    placeholder={placeholder ?? '+ Pick map'}
                    options={addOptions}
                    value=''
                    searchable
                    onSelect={(key) => onChange(key)}
                />
            </div>
        );
    }

    const name = formatMap(option?.map ?? base);
    const image = mapImage(option?.map, option?.image ?? undefined);
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
        <div className='match-filters__chips'>
            <span className='chip-filter chip-filter--hero chip-filter--map'>
                {image && (
                    <img className='chip-filter__img chip-filter__img--map' src={image} alt='' />
                )}
                <span className='chip-filter__name'>{name}</span>
                {hasReversed && (
                    <Dropdown
                        className='chip-filter__variant'
                        aria-label={`${name} version`}
                        variant='pill'
                        options={variantOptions}
                        value={variant ?? ''}
                        onSelect={(next) => onChange(next ? `${base}:${next}` : base)}
                    />
                )}
                <button
                    type='button'
                    className='chip-filter__remove'
                    aria-label={`Remove ${name}`}
                    onClick={() => onChange(undefined)}
                >
                    ×
                </button>
            </span>
        </div>
    );
}
