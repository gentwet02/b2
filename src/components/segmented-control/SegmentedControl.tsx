interface SegmentedControlProps<V extends string> {
    options: readonly { value: V; label: string }[];
    value: V;
    onChange: (value: V) => void;
    'aria-label'?: string;
    'aria-labelledby'?: string;
}

/** A row of toggle buttons, one pressed: "This season | All seasons". */
export default function SegmentedControl<V extends string>(props: SegmentedControlProps<V>) {
    const { options, value, onChange, ...aria } = props;

    return (
        <div className='segmented-control' role='group' {...aria}>
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
