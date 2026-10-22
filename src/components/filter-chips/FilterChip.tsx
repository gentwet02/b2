import type { ReactNode } from 'react';

interface FilterChipProps {
    name: string;
    /** a hero portrait or a map thumbnail: the chip turns sky blue */
    image?: { src: string | undefined; kind: 'hero' | 'map' } | undefined;
    /** e.g. a variant select, between the name and the remove button */
    children?: ReactNode;
    onRemove: () => void;
}

/** One active filter: its name, maybe a picture and a variant, and × to remove it. */
export default function FilterChip(props: FilterChipProps) {
    const { name, image, children, onRemove } = props;

    return (
        <span className={image ? 'filter-chip filter-chip--image' : 'filter-chip'}>
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
            <span className='filter-chip__name'>{name}</span>
            {children}
            <button
                type='button'
                className='filter-chip__remove'
                aria-label={`Remove ${name}`}
                onClick={onRemove}
            >
                ×
            </button>
        </span>
    );
}
