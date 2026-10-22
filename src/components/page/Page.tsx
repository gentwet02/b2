import type { ReactNode } from 'react';

interface PageProps {
    /** the page's own block class, e.g. 'stats' */
    className?: string;
    children: ReactNode;
}

/** A route's <main>: centered column, sections fading in one after the other. */
export default function Page(props: PageProps) {
    const { className, children } = props;

    return <main className={className ? `page ${className}` : 'page'}>{children}</main>;
}
