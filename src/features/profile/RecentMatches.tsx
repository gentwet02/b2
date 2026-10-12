import Dropdown from '@/components/dropdown/Dropdown';
import MatchCard from '@/components/match/MatchCard';
import { ErrorState, Loading } from '@/components/status/Status';
import { PROFILE_MATCH_AMOUNTS, PROFILE_MATCH_DEFAULT } from '@/config/profile';
import useMatchesHistory from '@/hooks/useMatchesHistory';
import useUserMatches from '@/hooks/useUserMatches';
import { getRouteApi, Link } from '@tanstack/react-router';

const routeApi = getRouteApi('/user/$userId');

interface RecentMatchesProps {
    userId: string;
    playerName?: string | undefined;
}

export default function RecentMatches(props: RecentMatchesProps) {
    const { userId, playerName } = props;

    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();

    const amount = search.matches ?? PROFILE_MATCH_DEFAULT;
    const stored = useMatchesHistory({ playerId: userId }, amount);
    const page = stored.data?.pages[0]?.matches;
    const recorded = stored.data?.pages.flatMap((p) => p.matches.items) ?? [];
    const useLive = stored.isSuccess && page?.total === 0;
    const live = useUserMatches(userId, useLive);
    const matches = useLive ? (live.data ?? []).slice(0, amount) : recorded;
    const isLoading = stored.isLoading || (useLive && live.isLoading);
    const error = stored.error ?? (useLive ? live.error : null);
    const remaining = page ? page.total - recorded.length : 0;

    function setAmount(n: number) {
        navigate({
            search: (prev) => ({ ...prev, matches: n === PROFILE_MATCH_DEFAULT ? undefined : n }),
            replace: true,
            resetScroll: false,
        });
    }

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
                <div className='recent-matches__amount'>
                    <span aria-hidden='true'>Show</span>
                    <Dropdown
                        variant='compact'
                        className='recent-matches__amount-select'
                        aria-label='Matches shown'
                        options={PROFILE_MATCH_AMOUNTS}
                        value={amount}
                        onSelect={setAmount}
                    />
                </div>
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
                        {stored.isFetchingNextPage
                            ? 'Loading…'
                            : `Show ${Math.min(amount, remaining)} more`}
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
