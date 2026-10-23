import type { ReactNode } from 'react';

interface FilterChipProps {
    name: string;
    /** a hero portrait or a map thumbnail: the chip turns sky blue */
    image?: { src: string | undefined; kind: 'hero' | 'map' } | undefined;
    /** an exclusion ("not this"): the chip turns red */
    excluded?: boolean | undefined;
    /** e.g. a variant select, between the name and the remove button */
    children?: ReactNode;
    onRemove: () => void;
}

/** One active filter: its name, maybe a picture and a variant, and × to remove it. */
export default function FilterChip(props: FilterChipProps) {
    const { name, image, excluded, children, onRemove } = props;

    const className = [
        'filter-chip',
        image && 'filter-chip--image',
        excluded && 'filter-chip--excluded',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <li className={className}>
            {image?.src && (
                <img
                    className={
                        image.kind === 'map'
                            ? 'filter-chip__img filter-chip__img--map'
                            : 'filter-chip__img'
                    }
                    src={image.src}
                    alt=''
                />
            )}
            <span className='filter-chip__name'>
                {excluded && <span className='visually-hidden'>Not </span>}
                {name}
            </span>
            {children}
            <button
                type='button'
                className='filter-chip__remove'
                aria-label={excluded ? `Stop excluding ${name}` : `Remove ${name}`}
                onClick={onRemove}
            >
                ×
            </button>
        </li>
    );
}
