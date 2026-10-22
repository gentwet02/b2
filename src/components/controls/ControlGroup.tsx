import type { ReactNode } from 'react';
import ControlLabel from './ControlLabel';

interface ControlGroupProps {
    label: ReactNode;
    /** to point aria-labelledby at the label */
    labelId?: string;
    /** takes the row's free space (searchable player selects) */
    grow?: boolean;
    children: ReactNode;
}

/** A label over its control, in a Controls row. */
export default function ControlGroup(props: ControlGroupProps) {
    const { label, labelId, grow, children } = props;

    return (
        <div className={grow ? 'controls__group controls__group--grow' : 'controls__group'}>
            <ControlLabel id={labelId}>{label}</ControlLabel>
            {children}
        </div>
    );
}
