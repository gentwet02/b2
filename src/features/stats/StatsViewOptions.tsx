import ControlCheckbox from '@/components/controls/ControlCheckbox';
import SplitVariants from '@/components/split-variants/SplitVariants';
import ControlLabel from '@/components/controls/ControlLabel';
import Dropdown from '@/components/dropdown/Dropdown';
import SegmentedControl from '@/components/segmented-control/SegmentedControl';
import { STATS_MIN_GAMES_OPTIONS, STATS_MIN_PICK_OPTIONS, STATS_VIEWS } from '@/config/stats';
import type { StatsSearch, StatsView } from '@/types/stats';

interface StatsViewOptionsProps {
    view: StatsView;
    towersOnly: boolean;
    min: number;
    minPick: number;
    onChange: (next: Partial<StatsSearch>) => void;
}

/** Above the table: which table, variants apart or not (the shared checkboxes), and the minimums for a row. */
export default function StatsViewOptions(props: StatsViewOptionsProps) {
    const { view, towersOnly, min, minPick, onChange } = props;

    return (
        <>
            <SegmentedControl
                aria-label='Show'
                options={STATS_VIEWS}
                value={view}
                onChange={(next) => onChange({ view: next })}
            />
            <SplitVariants
                maps={view === 'maps'}
                heroes={view === 'heroes' || (view === 'loadouts' && !towersOnly)}
            />
            {view === 'loadouts' && (
                <ControlCheckbox
                    checked={!towersOnly}
                    onChange={(checked) => onChange({ towersOnly: checked ? undefined : true })}
                >
                    Include hero
                </ControlCheckbox>
            )}
            <div className='stats-results__mins'>
                <label className='stats-results__min'>
                    <ControlLabel>Min. games</ControlLabel>
                    <Dropdown
                        className='stats-results__select'
                        variant='compact'
                        options={STATS_MIN_GAMES_OPTIONS}
                        value={min}
                        aria-label='Minimum games'
                        onSelect={(n) => onChange({ min: n })}
                    />
                </label>
                <label className='stats-results__min'>
                    <ControlLabel>Min. pick rate</ControlLabel>
                    <Dropdown
                        className='stats-results__select'
                        variant='compact'
                        options={STATS_MIN_PICK_OPTIONS}
                        value={minPick}
                        aria-label='Minimum pick rate'
                        onSelect={(n) => onChange({ pick: n })}
                    />
                </label>
            </div>
        </>
    );
}
