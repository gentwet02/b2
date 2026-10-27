import ControlCheckbox from '@/components/controls/ControlCheckbox';
import ControlLabel from '@/components/controls/ControlLabel';
import Dropdown from '@/components/dropdown/Dropdown';
import SegmentedControl from '@/components/segmented-control/SegmentedControl';
import { STATS_MIN_GAMES_OPTIONS, STATS_MIN_PICK_OPTIONS } from '@/config/stats';
import { MATCH_SORT_DEFAULT, MATCH_SORT_OPTIONS } from '@/config/match';
import type { MatchSort } from '@/types/match';
import type { StatsSearch, StatsView } from '@/types/stats';

interface StatsViewOptionsProps {
    /** the tabs: the picks tables, then the players ones that fit the sides */
    tabs: { value: StatsView; label: string }[];
    view: StatsView;
    towersOnly: boolean;
    min: number;
    minPick: number;
    /** games tab: their order */
    sort: MatchSort;
    onChange: (next: Partial<StatsSearch>) => void;
}

const PICKS: StatsView[] = ['heroes', 'towers', 'loadouts', 'maps'];

/** Above the table: which table, and for the picks tables the minimums for a row. */
export default function StatsViewOptions(props: StatsViewOptionsProps) {
    const { tabs, view, towersOnly, min, minPick, sort, onChange } = props;
    const picks = PICKS.includes(view);

    return (
        <>
            {/* a row of their own, top left; what goes with the table comes below */}
            <div className='stats-results__tabs'>
                <SegmentedControl
                    aria-label='Show'
                    options={tabs}
                    value={view}
                    onChange={(next) => onChange({ view: next })}
                />
            </div>
            {view === 'loadouts' && (
                <ControlCheckbox
                    checked={!towersOnly}
                    onChange={(checked) => onChange({ towersOnly: checked ? undefined : true })}
                >
                    Include hero
                </ControlCheckbox>
            )}
            {view === 'games' && (
                <label className='stats-results__min'>
                    <ControlLabel>Sort</ControlLabel>
                    <Dropdown
                        className='stats-results__sort'
                        variant='compact'
                        options={MATCH_SORT_OPTIONS}
                        value={sort}
                        aria-label='Order of the games'
                        onSelect={(next) =>
                            onChange({ sort: next === MATCH_SORT_DEFAULT ? undefined : next })
                        }
                    />
                </label>
            )}
            {(picks || view === 'players' || view === 'opponents') && (
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
                    {picks && (
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
                    )}
                </div>
            )}
        </>
    );
}
