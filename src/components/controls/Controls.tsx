import type { ReactNode } from 'react';

interface ControlsProps {
    className?: string;
    /** last, on the right: next to the selects when there's room, else under them */
    aside?: ReactNode;
    children: ReactNode;
}

/** A wrapping row of labelled controls (selects, toggles, checkboxes). */
export default function Controls(props: ControlsProps) {
    const { className, aside, children } = props;

    return (
        <div className={className ? `controls ${className}` : 'controls'}>
            {children}
            {aside != null && <div className='controls__aside'>{aside}</div>}
        </div>
    );
}
