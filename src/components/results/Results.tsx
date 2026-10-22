import type { ReactNode } from 'react';

interface ResultsProps {
    /** older data on screen while the new one loads: faded */
    updating?: boolean;
    children: ReactNode;
}

/** The panels under a page's controls. */
export default function Results(props: ResultsProps) {
    const { updating, children } = props;

    return <div className={updating ? 'results results--updating' : 'results'}>{children}</div>;
}
