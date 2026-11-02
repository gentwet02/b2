import type { ReactNode } from 'react';
import { mods } from '@/utils/className';

interface ResultsProps {
    /** older data on screen while the new one loads: faded */
    updating?: boolean;
    children: ReactNode;
}

/** The panels under a page's controls. */
export default function Results(props: ResultsProps) {
    const { updating, children } = props;

    return <div className={mods('results', updating && 'updating')}>{children}</div>;
}
