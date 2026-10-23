interface ChipClearProps {
    /** what's cleared, for screen readers: "towers" */
    what: string;
    onClear: () => void;
}

/** "Clear" after a chip list's selects: empties its picks and exclusions at once. */
export default function ChipClear({ what, onClear }: ChipClearProps) {
    return (
        <button
            type='button'
            className='text-link filter-chips__clear'
            aria-label={`Clear ${what}`}
            onClick={onClear}
        >
            Clear
        </button>
    );
}
