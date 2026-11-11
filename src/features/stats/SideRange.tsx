import RangeControl from '@/components/controls/RangeControl';
import { validExclude } from '@/config/ranges';
import type { SideDraft, SideState } from '@/types/stats';

interface SideRangeProps {
    side: SideState;
    /** what a list's picker holds until "+" or "×" */
    draft: SideDraft;
    'aria-label': string;
    onRange: (range: string) => void;
    onExclude: (exclude: string | undefined) => void;
    onDraft: (next: Partial<SideDraft>) => void;
}

/**
 * A side's range: the side's own (in the URL), or, once the side is a list, the next range
 * to count or leave out.
 */
export default function SideRange(props: SideRangeProps) {
    const { side, draft, 'aria-label': ariaLabel, onRange, onExclude, onDraft } = props;

    const listed = side.mode === 'list';
    const { range, exclude } = listed ? draft : side;

    return (
        <RangeControl
            aria-label={ariaLabel}
            range={range}
            exclude={exclude}
            onRange={
                listed
                    ? (next) => onDraft({ range: next, exclude: validExclude(next, draft.exclude) })
                    : onRange
            }
            onExclude={listed ? (next) => onDraft({ exclude: next }) : onExclude}
        />
    );
}
