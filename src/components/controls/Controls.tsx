import type { ReactNode } from 'react';

interface ControlsProps {
    className?: string;
    children: ReactNode;
}

/** A wrapping row of labelled controls (selects, toggles, checkboxes). */
export default function Controls(props: ControlsProps) {
    const { className, children } = props;

    return <div className={className ? `controls ${className}` : 'controls'}>{children}</div>;
}
