import { SearchIcon } from '@/components/icons';
import MatchCard from '@/components/match/MatchCard';
import { ErrorState, Loading, StatusMessage } from '@/components/status/Status';
import useMatchesHistory from '@/hooks/useMatchesHistory';
import { formatMap, formatNumber, timeAgo } from '@/utils/format';
import { useDeferredValue, useMemo, useState } from 'react';

const PAGE = 20;

export default function MatchesHistory() {
    const { data, isLoading, error, refetch } = useMatchesHistory();
    const [search, setSearch] = useState('');
    const [map, setMap] = useState('');
    const [shown, setShown] = useState(PAGE);
    const term = useDeferredValue(search.trim().toLowerCase());

    const matches = useMemo(() => data?.matches ?? [], [data]);

    const maps = useMemo(
        () =>
            [...new Set(matches.map((m) => m.map))].sort((a, b) =>
                formatMap(a).localeCompare(formatMap(b)),
            ),
        [matches],
    );

    const filtered = useMemo(
        () =>
            matches.filter(
                (m) =>
                    (!map || m.map === map) &&
                    (!term ||
                        m.playerLeft.displayName.toLowerCase().includes(term) ||
                        m.playerRight.displayName.toLowerCase().includes(term)),
            ),
        [matches, map, term],
    );

    if (isLoading) return <Loading label='Loading matches…' />;

    const updated = timeAgo(data?.lastUpdated);

    return (
        <main className='page matches'>
            <div className='page__head'>
                <div>
                    <h1 className='page__title'>Recent ranked matches</h1>
                    <p className='page__subtitle'>
                        {data
                            ? `${formatNumber(data.totalMatches)} matches played by Hall of Masters players${updated ? `, updated ${updated}` : ''}`
                            : 'Matches played by Hall of Masters players'}
                    </p>
                </div>
            </div>

            {error && <ErrorState error={error} onRetry={() => refetch()} />}

            {!error && data === null && (
                <StatusMessage title='Collecting matches'>
                    The server is downloading every Hall of Masters player's match history. This
                    takes a few minutes after it starts; this page checks again every 30 seconds.
                </StatusMessage>
            )}

            {data && (
                <>
                    <div className='matches__filters'>
                        <label className='matches__search'>
                            <span className='visually-hidden'>Find a player</span>
                            <SearchIcon className='matches__search-icon' aria-hidden='true' />
                            <input
                                type='search'
                                value={search}
                                placeholder='Find a player'
                                onChange={(e) => {
                                    setSearch(e.target.value);
                                    setShown(PAGE);
                                }}
                            />
                        </label>
                        <label>
                            <span className='visually-hidden'>Map</span>
                            <select
                                className='select'
                                value={map}
                                onChange={(e) => {
                                    setMap(e.target.value);
                                    setShown(PAGE);
                                }}
                            >
                                <option value=''>All maps</option>
                                {maps.map((m) => (
                                    <option key={m} value={m}>
                                        {formatMap(m)}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <span className='matches__count' aria-live='polite'>
                            {formatNumber(filtered.length)} matches
                        </span>
                    </div>

                    {filtered.length === 0 ? (
                        <StatusMessage
                            title='No matches found'
                            action={
                                <button
                                    type='button'
                                    className='button button--quiet'
                                    onClick={() => {
                                        setSearch('');
                                        setMap('');
                                    }}
                                >
                                    Clear filters
                                </button>
                            }
                        >
                            No match fits this player name and map. Clear the filters to see every
                            match.
                        </StatusMessage>
                    ) : (
                        <ul className='matches__list'>
                            {filtered.slice(0, shown).map((match) => (
                                <li key={match.id}>
                                    <MatchCard match={match} />
                                </li>
                            ))}
                        </ul>
                    )}

                    {filtered.length > shown && (
                        <button
                            type='button'
                            className='button button--quiet matches__more'
                            onClick={() => setShown((n) => n + PAGE)}
                        >
                            Show {Math.min(PAGE, filtered.length - shown)} more
                        </button>
                    )}
                </>
            )}
        </main>
    );
}
