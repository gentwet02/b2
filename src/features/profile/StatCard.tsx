import type { ReactNode } from 'react';
import { bem } from '@/utils/className';

interface StatCardProps {
    title: ReactNode;
    /** the highlighted card (this season) */
    accent?: boolean;
    /** no data (yet): a dimmed card */
    placeholder?: boolean;
    busy?: boolean;
    children: ReactNode;
}

/** One of the two record cards at the top of a profile. */
export default function StatCard(props: StatCardProps) {
    const { title, accent, placeholder, busy, children } = props;

    const className = bem('stats-panel', accent && 'accent', placeholder && 'loading');
    return (
        <section className={className} aria-busy={busy}>
            <h2 className='stats-panel__title'>{title}</h2>
            {children}
        </section>
    );
}
