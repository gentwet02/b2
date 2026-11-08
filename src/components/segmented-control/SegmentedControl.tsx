import type { CSSProperties } from 'react';
import { bem } from '@/utils/className';

interface SegmentedControlProps<V extends string> {
    options: readonly { value: V; label: string }[];
    value: V;
    onChange: (value: V) => void;
    /** Too many options for a narrow screen: there, they become a grid of balanced rows. */
    wrap?: boolean | undefined;
    'aria-label'?: string;
    'aria-labelledby'?: string;
}

/** A row of toggle buttons, one pressed: "This season | All seasons". */
export default function SegmentedControl<V extends string>(props: SegmentedControlProps<V>) {
    const { options, value, onChange, wrap, ...aria } = props;

    // rows of at most 4, as even as they can be: 5 → 3 + 2, 7 → 4 + 3
    const rows = Math.ceil(options.length / 4);
    const style = wrap
        ? ({ '--per-row': Math.ceil(options.length / rows) } as CSSProperties)
        : undefined;

    return (
        <div
            className={bem('segmented-control', wrap && 'wrap')}
            style={style}
            role='group'
            {...aria}
        >
            {options.map((option) => (
                <button
                    key={option.value}
                    type='button'
                    className='segmented-control__option'
                    aria-pressed={option.value === value}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    );
}
