import type { ReactNode } from 'react';

interface PageHeaderProps {
    title?: ReactNode;
    subtitle?: ReactNode;
    /** buttons and selects on the right */
    actions?: ReactNode;
}

export default function PageHeader(props: PageHeaderProps) {
    const { title, subtitle, actions } = props;

    return (
        <div className='page__head'>
            {title != null && (
                <div>
                    <h1 className='page__title'>{title}</h1>
                    {subtitle != null && <p className='page__subtitle'>{subtitle}</p>}
                </div>
            )}
            {actions != null && <div className='page__actions'>{actions}</div>}
        </div>
    );
}
