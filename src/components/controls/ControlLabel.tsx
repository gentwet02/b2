import type { ReactNode } from 'react';

interface ControlLabelProps {
    id?: string | undefined;
    children: ReactNode;
}

/** The small capitals over a control. */
export default function ControlLabel(props: ControlLabelProps) {
    const { id, children } = props;

    return (
        <span className='controls__label' id={id}>
            {children}
        </span>
    );
}
