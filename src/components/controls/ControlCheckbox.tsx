import type { ReactNode } from 'react';

interface ControlCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children: ReactNode;
}

/** A checkbox the height of the selects next to it. */
export default function ControlCheckbox(props: ControlCheckboxProps) {
    const { checked, onChange, children } = props;

    return (
        <label className='controls__check'>
            <input
                type='checkbox'
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
            />
            {children}
        </label>
    );
}
