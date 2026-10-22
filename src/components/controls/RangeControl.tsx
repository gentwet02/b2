import ControlGroup from '@/components/controls/ControlGroup';
import Dropdown from '@/components/dropdown/Dropdown';
import { LEADERBOARD_RANGES, rangesBefore } from '@/config/ranges';

interface RangeControlProps {
    range: string;
    /** a smaller range left out at the top (top 50 without the top 10 → ranks 11–50) */
    exclude: string | undefined;
    onRange: (range: string) => void;
    onExclude: (exclude: string | undefined) => void;
    'aria-label': string;
}

const NOBODY = { value: '', label: 'Nobody' };

/** A part of each season's leaderboard, and a smaller range to leave out of it. */
export default function RangeControl(props: RangeControlProps) {
    const { range, exclude, onRange, onExclude, 'aria-label': ariaLabel } = props;

    const before = rangesBefore(range);

    return (
        <>
            <ControlGroup label='Range'>
                <Dropdown
                    className='controls__range'
                    variant='compact'
                    options={LEADERBOARD_RANGES}
                    value={range}
                    aria-label={ariaLabel}
                    onSelect={onRange}
                />
            </ControlGroup>
            {before.length > 0 && (
                <ControlGroup label='Leave out'>
                    <Dropdown
                        className='controls__range'
                        variant='compact'
                        options={[NOBODY, ...before]}
                        value={exclude ?? ''}
                        aria-label='Leave out the players of'
                        onSelect={(next) => onExclude(next || undefined)}
                    />
                </ControlGroup>
            )}
        </>
    );
}
