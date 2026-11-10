import { useMemo } from 'react';
import { getRouteApi, Link } from '@tanstack/react-router';
import ControlCheckbox from '@/components/controls/ControlCheckbox';
import Dropdown from '@/components/dropdown/Dropdown';
import MatchList from '@/components/match/MatchList';
import Panel from '@/components/panel/Panel';
import PanelEmpty from '@/components/panel/PanelEmpty';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import { MATCH_SORT_DEFAULT } from '@/config/match';
import { PROFILE_MATCH_AMOUNTS, PROFILE_MATCH_DEFAULT } from '@/config/profile';
// shared: the profile's recent matches card
import '@/features/profile/RecentMatches.scss';
import useCompareGames from '@/hooks/queries/useCompareGames';
import useKeepSide, { setKeepSide } from '@/hooks/useKeepSide';
import type { CompareParams } from '@/services/api/compare';
import type { ClanMember } from '@/types/clan';
import { formatNumber } from '@/utils/format';

const routeApi = getRouteApi('/clan/$clanId');

interface ClanMatchesProps {
    clanId: string;
    /** the clan's known members: theirs is the side shown, on the left with "keep side" */
    members: ClanMember[];
}

/** The clan's members' matches this season, newest first, like a profile's recent matches. */
export default function ClanMatches(props: ClanMatchesProps) {
    const { clanId, members } = props;

    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();

    const amount = search.matches ?? PROFILE_MATCH_DEFAULT;
    const params = useMemo<CompareParams>(
        () => ({ a: { clan: clanId }, b: { anyone: true } }),
        [clanId],
    );
    const games = useCompareGames(params, MATCH_SORT_DEFAULT, amount);
    const pages = games.data?.pages ?? [];
    const matches = pages.flatMap((p) => p.items);
    const total = pages[0]?.total ?? 0;
    const remaining = total - matches.length;
    const memberIds = useMemo(() => new Set(members.map((m) => m.userId)), [members]);
    const keepSide = useKeepSide();

    function setAmount(n: number) {
        navigate({
            search: (prev) => ({ ...prev, matches: n === PROFILE_MATCH_DEFAULT ? undefined : n }),
            replace: true,
            resetScroll: false,
        });
    }

    return (
        <Panel
            title='Recent matches'
            headClassName='recent-matches__head'
            actions={
                <>
                    {total > 0 && (
                        <span className='panel__note'>
                            {formatNumber(total)} recorded this season
                        </span>
                    )}
                    <div className='recent-matches__controls'>
                        <ControlCheckbox checked={keepSide} onChange={setKeepSide}>
                            Clan on the left
                        </ControlCheckbox>
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
                </>
            }
        >
            {games.isLoading && <Loading label='Loading matches…' />}
            {games.error && <ErrorState error={games.error} onRetry={() => games.refetch()} />}
            {!games.isLoading && !games.error && matches.length === 0 && (
                <PanelEmpty>No match on record for this clan this season.</PanelEmpty>
            )}
            {matches.length > 0 && <MatchList matches={matches} perspectiveIds={memberIds} />}
            <div className='recent-matches__actions'>
                {games.hasNextPage && (
                    <button
                        type='button'
                        className='button--quiet'
                        onClick={() => games.fetchNextPage()}
                        disabled={games.isFetchingNextPage}
                    >
                        {games.isFetchingNextPage
                            ? 'Loading…'
                            : `Show ${Math.min(amount, remaining)} more`}
                    </button>
                )}
                {total > 0 && (
                    <Link
                        to='/stats'
                        search={{ clan: clanId, view: 'games' }}
                        className='text-link'
                    >
                        Filter the clan's matches
                    </Link>
                )}
            </div>
        </Panel>
    );
}
