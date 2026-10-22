interface DropdownOptionProps {
    id: string;
    index: number;
    label: string;
    /** where the arrow keys / pointer are */
    active: boolean;
    /** the selected value */
    current: boolean;
    onHover: () => void;
    onSelect: () => void;
}

export default function DropdownOption(props: DropdownOptionProps) {
    const { id, index, label, active, current, onHover, onSelect } = props;

    const className = [
        'dropdown__option',
        active && 'dropdown__option--active',
        current && 'dropdown__option--current',
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <li
            id={id}
            data-index={index}
            role='option'
            aria-selected={active}
            className={className}
            // keep the focus in the input
            onMouseDown={(event) => event.preventDefault()}
            onMouseMove={onHover}
            onClick={onSelect}
        >
            {label}
        </li>
    );
}
