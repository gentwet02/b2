import type { ReactNode } from 'react';
import { bem } from '@/utils/className';

interface ItemLabelProps {
    image: string | undefined;
    /** hero, tower: our pictures (gamePictures); portrait: NK's round hero portrait */
    kind: 'hero' | 'tower' | 'portrait' | 'map';
    children: ReactNode;
    /** smaller second line */
    sub?: ReactNode;
    /** pictures in a row (LoadoutPictures): in the thumbnail's place where there is room for them */
    pictures?: ReactNode;
}

/** A thumbnail (or its empty frame) and a name: the first cell of the record tables. */
export default function ItemLabel(props: ItemLabelProps) {
    const { image, kind, children, sub, pictures } = props;

    const thumb = `item-label__${kind}`;
    return (
        <span className={bem('item-label', pictures != null && 'pictures')}>
            {image ? (
                <img className={thumb} src={image} alt='' loading='lazy' />
            ) : (
                <span className={`${thumb}--empty`} aria-hidden='true' />
            )}
            <span className='item-label__text'>
                {children}
                {sub != null && <span className='item-label__sub'>{sub}</span>}
            </span>
            {pictures != null && <span className='item-label__pictures'>{pictures}</span>}
        </span>
    );
}
