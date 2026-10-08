import { LEADERBOARD_MIN_GAMES } from '@/config/leaderboard';
import {
    LEADERBOARD_SORT_LABELS,
    LEADERBOARD_SORTS,
    type LeaderboardSort,
    type LeaderboardView,
} from '@/types/leaderboard';

interface LeaderboardFiltersProps {
    view: Required<LeaderboardView>;
    onChange: (patch: LeaderboardView) => void;
}

export default function LeaderboardFilters({ view, onChange }: LeaderboardFiltersProps) {
    const changed = view.sort !== 'rank' || view.minGames > 0 || view.knownOnly;

    return (
        <section className='leaderboard-filters' aria-label='Sort and filters'>
            <label className='leaderboard-filters__field'>
                <span className='leaderboard-filters__label'>Sort by</span>
                <select
                    className='select'
                    value={view.sort}
                    onChange={(e) => onChange({ sort: e.target.value as LeaderboardSort })}
                >
                    {LEADERBOARD_SORTS.map((sort) => (
                        <option key={sort} value={sort}>
                            {LEADERBOARD_SORT_LABELS[sort]}
                        </option>
                    ))}
                </select>
            </label>

            <label className='leaderboard-filters__field'>
                <span className='leaderboard-filters__label'>Games played</span>
                <select
                    className='select'
                    value={view.minGames}
                    onChange={(e) => onChange({ minGames: Number(e.target.value) })}
                >
                    {LEADERBOARD_MIN_GAMES.map((min) => (
                        <option key={min} value={min}>
                            {min === 0 ? 'Any' : `${min}+`}
                        </option>
                    ))}
                </select>
            </label>

            <label className='leaderboard-filters__check'>
                <input
                    type='checkbox'
                    checked={view.knownOnly}
                    onChange={(e) => onChange({ knownOnly: e.target.checked })}
                />
                Known players only
            </label>

            {changed && (
                <button
                    type='button'
                    className='text-link leaderboard-filters__reset'
                    onClick={() => onChange({ sort: 'rank', minGames: 0, knownOnly: false })}
                >
                    Reset
                </button>
            )}
        </section>
    );
}
