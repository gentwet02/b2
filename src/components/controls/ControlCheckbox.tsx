import type { ReactNode } from 'react';
import { cx } from '@/utils/className';

interface ControlCheckboxProps {
    checked: boolean;
    onChange: (checked: boolean) => void;
    children: ReactNode;
    className?: string | undefined;
}

/** A checkbox the height of the selects next to it. */
export default function ControlCheckbox(props: ControlCheckboxProps) {
    const { checked, onChange, children, className } = props;

    return (
        <label className={cx('controls__check', className)}>
            <input
                type='checkbox'
                checked={checked}
                onChange={(event) => onChange(event.target.checked)}
            />
            {children}
        </label>
    );
}
