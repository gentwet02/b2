import type { ReactNode } from 'react';
import { bem, mods } from '@/utils/className';

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

    const className = bem('filter-chip', image && 'image', excluded && 'excluded');

    return (
        <li className={className}>
            {image?.src && (
                <img
                    className={mods('filter-chip__img', image.kind === 'map' && 'map')}
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
