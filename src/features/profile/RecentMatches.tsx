import { getRouteApi, Link } from '@tanstack/react-router';
import Dropdown from '@/components/dropdown/Dropdown';
import MatchList from '@/components/match/MatchList';
import Panel from '@/components/panel/Panel';
import PanelEmpty from '@/components/panel/PanelEmpty';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import { PROFILE_MATCH_AMOUNTS, PROFILE_MATCH_DEFAULT } from '@/config/profile';
import useMatchesHistory from '@/hooks/queries/useMatchesHistory';
import useUserMatches from '@/hooks/queries/useUserMatches';

const routeApi = getRouteApi('/user/$userId');

interface RecentMatchesProps {
    userId: string;
    playerName?: string | undefined;
}

/** The player's matches this season from our database, or NK's latest when we have none. */
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
        <Panel
            className='panel--matches'
            title='Recent matches'
            actions={
                <>
                    {page && page.total > 0 && (
                        <span className='panel__note'>{page.total} recorded this season</span>
                    )}
                    {useLive && matches.length > 0 && (
                        <span className='panel__note'>Latest matches from Ninja Kiwi</span>
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
                </>
            }
        >
            {isLoading && <Loading label='Loading matches…' />}
            {error && (
                <ErrorState
                    error={error}
                    onRetry={() => (useLive ? live.refetch() : stored.refetch())}
                />
            )}
            {!isLoading && !error && matches.length === 0 && (
                <PanelEmpty>No recent matches on record.</PanelEmpty>
            )}
            {matches.length > 0 && <MatchList matches={matches} perspectiveId={userId} />}
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
        </Panel>
    );
}
