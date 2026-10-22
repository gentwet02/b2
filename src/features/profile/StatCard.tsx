import type { ReactNode } from 'react';

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

    const className = [
        'stats-panel',
        accent && 'stats-panel--accent',
        placeholder && 'stats-panel--loading',
    ]
        .filter(Boolean)
        .join(' ');
    return (
        <section className={className} aria-busy={busy}>
            <h2 className='stats-panel__title'>{title}</h2>
            {children}
        </section>
    );
}
