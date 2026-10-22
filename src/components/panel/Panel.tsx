import type { HTMLAttributes, ReactNode } from 'react';

interface PanelProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
    title?: ReactNode;
    titleClassName?: string;
    /** soft text next to the title */
    note?: ReactNode;
    /** anything else in the head: toggles, selects, links */
    actions?: ReactNode;
    headClassName?: string;
    children?: ReactNode;
}

/** A card section: a head (title, note, actions) over its content. */
export default function Panel(props: PanelProps) {
    const { title, titleClassName, note, actions, headClassName, className, children, ...rest } =
        props;

    const hasHead = title != null || note != null || actions != null;

    return (
        <section className={className ? `panel ${className}` : 'panel'} {...rest}>
            {hasHead && (
                <div className={headClassName ? `panel__head ${headClassName}` : 'panel__head'}>
                    {title != null && (
                        <h2
                            className={
                                titleClassName ? `panel__title ${titleClassName}` : 'panel__title'
                            }
                        >
                            {title}
                        </h2>
                    )}
                    {note != null && <span className='panel__note'>{note}</span>}
                    {actions}
                </div>
            )}
            {children}
        </section>
    );
}
