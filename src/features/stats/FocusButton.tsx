import type { StatsSearch } from '@/types/stats';

interface FocusButtonProps {
    /** the filters it sets; null: the row is already the focus (no button) */
    next: Partial<StatsSearch> | null;
    onFocus: (next: Partial<StatsSearch>) => void;
}

/** A stats row's "Focus →": filters the page on that hero, towers, strat or map. */
export default function FocusButton(props: FocusButtonProps) {
    const { next, onFocus } = props;
    if (!next) return null;
    return (
        <button type='button' className='drill-link' onClick={() => onFocus(next)}>
            <span className='drill-link__text'>Focus </span>→
        </button>
    );
}
