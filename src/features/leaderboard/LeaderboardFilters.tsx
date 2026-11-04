import ControlCheckbox from '@/components/controls/ControlCheckbox';
import Dropdown from '@/components/dropdown/Dropdown';
import { LEADERBOARD_MIN_GAMES_OPTIONS } from '@/config/leaderboard';
import type { LeaderboardView } from '@/types/leaderboard';

interface LeaderboardFiltersProps {
    view: Required<LeaderboardView>;
    onChange: (patch: LeaderboardView) => void;
}

/**
 * Minimum games and the old-names search, shown next to the table's page size. Sorting is done
 * from the headers.
 */
export default function LeaderboardFilters(props: LeaderboardFiltersProps) {
    const { view, onChange } = props;

    return (
        <>
            <ControlCheckbox
                checked={view.allNames}
                onChange={(allNames) => onChange({ allNames })}
            >
                <span title='Also find players by the names they went by before'>
                    Include old names
                </span>
            </ControlCheckbox>
            <label className='leaderboard-filters'>
                <span className='leaderboard-filters__label'>Min. games</span>
                <Dropdown
                    className='leaderboard-filters__select'
                    variant='compact'
                    options={LEADERBOARD_MIN_GAMES_OPTIONS}
                    value={view.minGames}
                    aria-label='Minimum games played'
                    onSelect={(minGames) => onChange({ minGames })}
                />
            </label>
        </>
    );
}
