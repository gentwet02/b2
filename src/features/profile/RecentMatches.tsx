import MatchCard from '@/components/match/MatchCard';
import { ErrorState, Loading } from '@/components/status/Status';
import useMatchesHistory from '@/hooks/useMatchesHistory';
import useUserMatches from '@/hooks/useUserMatches';
import { Link } from '@tanstack/react-router';

/**
 * The player's matches recorded this season (database: fast, paged).
 * Players we never recorded fall back to Ninja Kiwi's short live list.
 */
export default function RecentMatches({
    userId,
    playerName,
}: {
    userId: string;
    playerName?: string | undefined;
}) {
    const stored = useMatchesHistory({ playerId: userId });
    const page = stored.data?.pages[0]?.matches;
    const recorded = stored.data?.pages.flatMap((p) => p.matches.items) ?? [];
    const useLive = stored.isSuccess && page?.total === 0;
    const live = useUserMatches(userId, useLive);

    const matches = useLive ? (live.data ?? []) : recorded;
    const isLoading = stored.isLoading || (useLive && live.isLoading);
    const error = stored.error ?? (useLive ? live.error : null);

    return (
        <section className='profile-panel profile-panel--matches'>
            <div className='profile-panel__head'>
                <h2 className='profile-panel__title'>Recent matches</h2>
                {page && page.total > 0 && (
                    <span className='profile-panel__note'>{page.total} recorded this season</span>
                )}
                {useLive && matches.length > 0 && (
                    <span className='profile-panel__note'>Latest matches from Ninja Kiwi</span>
                )}
            </div>
            {isLoading && <Loading label='Loading matches…' />}
            {error && (
                <ErrorState
                    error={error}
                    onRetry={() => (useLive ? live.refetch() : stored.refetch())}
                />
            )}
            {!isLoading && !error && matches.length === 0 && (
                <p className='profile-panel__empty'>No recent matches on record.</p>
            )}
            {matches.length > 0 && (
                <ul className='recent-matches'>
                    {matches.map((match) => (
                        <li key={match.id}>
                            <MatchCard match={match} perspectiveId={userId} />
                        </li>
                    ))}
                </ul>
            )}
            <div className='recent-matches__actions'>
                {!useLive && stored.hasNextPage && (
                    <button
                        type='button'
                        className='button button--quiet'
                        onClick={() => stored.fetchNextPage()}
                        disabled={stored.isFetchingNextPage}
                    >
                        {stored.isFetchingNextPage ? 'Loading…' : 'Show more'}
                    </button>
                )}
                {page && page.total > 0 && playerName && (
                    <Link
                        to='/matches-history'
                        search={{ player: playerName }}
                        className='text-link'
                    >
                        Filter {playerName}'s matches
                    </Link>
                )}
            </div>
        </section>
    );
}
