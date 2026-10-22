import Dropdown from '@/components/dropdown/Dropdown';
import { LEADERBOARD_MIN_GAMES_OPTIONS } from '@/config/leaderboard';
import type { LeaderboardView } from '@/types/leaderboard';

interface LeaderboardFiltersProps {
    view: Required<LeaderboardView>;
    onChange: (patch: LeaderboardView) => void;
}

/** Minimum games, shown next to the table's page size. Sorting is done from the headers. */
export default function LeaderboardFilters(props: LeaderboardFiltersProps) {
    const { view, onChange } = props;

    return (
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
    );
}
