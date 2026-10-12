import Dropdown from '@/components/dropdown/Dropdown';
import { LEADERBOARD_MIN_GAMES } from '@/config/leaderboard';
import {
    LEADERBOARD_SORT_LABELS,
    LEADERBOARD_SORTS,
    type LeaderboardView,
} from '@/types/leaderboard';

const SORT_OPTIONS = LEADERBOARD_SORTS.map((value) => ({
    value,
    label: LEADERBOARD_SORT_LABELS[value],
}));

const MIN_GAMES_OPTIONS = LEADERBOARD_MIN_GAMES.map((value) => ({
    value,
    label: value === 0 ? 'Any' : `${value}+`,
}));

interface LeaderboardFiltersProps {
    view: Required<LeaderboardView>;
    onChange: (patch: LeaderboardView) => void;
}

export default function LeaderboardFilters(props: LeaderboardFiltersProps) {
    const { view, onChange } = props;

    const changed = view.sort !== 'rank' || view.minGames > 0;

    return (
        <section className='leaderboard-filters' aria-label='Sort and filters'>
            <div className='leaderboard-filters__field'>
                <label htmlFor='leaderboard-sort' className='leaderboard-filters__label'>
                    Sort by
                </label>
                <Dropdown
                    id='leaderboard-sort'
                    options={SORT_OPTIONS}
                    value={view.sort}
                    onSelect={(sort) => onChange({ sort })}
                />
            </div>

            <div className='leaderboard-filters__field'>
                <label htmlFor='leaderboard-min-games' className='leaderboard-filters__label'>
                    Games played
                </label>
                <Dropdown
                    id='leaderboard-min-games'
                    options={MIN_GAMES_OPTIONS}
                    value={view.minGames}
                    onSelect={(minGames) => onChange({ minGames })}
                />
            </div>

            {changed && (
                <button
                    type='button'
                    className='text-link leaderboard-filters__reset'
                    onClick={() => onChange({ sort: 'rank', minGames: 0 })}
                >
                    Reset
                </button>
            )}
        </section>
    );
}
