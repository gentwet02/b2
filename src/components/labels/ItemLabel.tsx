import type { ReactNode } from 'react';

interface ItemLabelProps {
    image: string | undefined;
    kind: 'hero' | 'map';
    children: ReactNode;
    /** smaller second line */
    sub?: ReactNode;
}

/** A thumbnail (or its empty frame) and a name: the first cell of the record tables. */
export default function ItemLabel(props: ItemLabelProps) {
    const { image, kind, children, sub } = props;

    const thumb = `item-label__${kind}`;
    return (
        <span className='item-label'>
            {image ? (
                <img className={thumb} src={image} alt='' loading='lazy' />
            ) : (
                <span className={`${thumb} ${thumb}--empty`} aria-hidden='true' />
            )}
            <span className='item-label__text'>
                {children}
                {sub != null && <span className='item-label__sub'>{sub}</span>}
            </span>
        </span>
    );
}
