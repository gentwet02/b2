import { mods } from '@/utils/className';

interface SideAddProps {
    /** what the button does, for its tooltip and screen readers */
    label: string;
    /** "×" instead of "+": what the picker holds is left out of the side */
    excluding?: boolean | undefined;
    onClick: () => void;
}

/**
 * The round buttons after a side's picker: "+" counts what it holds with the rest of the
 * side, "×" leaves it out.
 */
export default function SideAdd(props: SideAddProps) {
    const { label, excluding, onClick } = props;

    return (
        <button
            type='button'
            className={mods('stats-sides__add', excluding && 'exclude')}
            title={label}
            aria-label={label}
            onClick={onClick}
        >
            {excluding ? '×' : '+'}
        </button>
    );
}
