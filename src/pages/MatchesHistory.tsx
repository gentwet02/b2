import { getRouteApi, type NavigateOptions } from '@tanstack/react-router';
import MatchList from '@/components/match/MatchList';
import Page from '@/components/page/Page';
import PageHeader from '@/components/page/PageHeader';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import StatusMessage from '@/components/status/StatusMessage';
import MatchFilters from '@/features/match/MatchFilters';
import useMatchesHistory from '@/hooks/queries/useMatchesHistory';
import useMatchFilters from '@/hooks/queries/useMatchFilters';
import useSeasons from '@/hooks/queries/useSeasons';
import useUrlText from '@/hooks/useUrlText';
import type { MatchesQuery, MatchPick } from '@/types/match';
import { formatNumber, plural, timeAgo } from '@/utils/format';
import { addPick, isFiltering, NO_FILTERS } from '@/utils/matchFilters';
import { allSeasonsLabel } from '@/utils/season';

const routeApi = getRouteApi('/matches-history');

export default function MatchesHistory() {
    const query = routeApi.useSearch();
    const navigate = routeApi.useNavigate();

    const setQuery = (
        patch: Partial<MatchesQuery>,
        options?: Pick<NavigateOptions, 'viewTransition'>,
    ) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true, ...options });

    const [text, setText] = useUrlText(query.player, (player) => setQuery({ player }));
    // same player mode: the other side's name
    const [text2, setText2] = useUrlText(query.player2, (player2) => setQuery({ player2 }));

    const seasons = useSeasons();
    const filters = useMatchFilters(query);
    const {
        data,
        isLoading,
        isFetching,
        isPlaceholderData,
        error,
        refetch,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
    } = useMatchesHistory(query);

    const first = data?.pages[0];
    const page = first?.matches;
    const crawl = first?.crawl ?? null;
    const matches = data?.pages.flatMap((p) => p.matches.items) ?? [];
    const filtering = isFiltering(query);
    const seasonId = query.season ?? page?.seasonId ?? seasons.data?.liveSeason;
    const seasonText = allSeasonsLabel(seasonId, page);

    // clicking a hero, tower or map on a card adds it to the filters
    const pick = (clicked: MatchPick) => {
        const patch = addPick(query, clicked, filters.data);
        if (!patch) return;
        setQuery(patch);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setText('');
        setText2('');
        setQuery(NO_FILTERS);
    };

    if (isLoading) return <Loading label='Loading matches…' />;

    return (
        <Page className='matches'>
            <PageHeader
                title='Ranked matches'
                subtitle={
                    page
                        ? `${formatNumber(page.totalMatches)} matches recorded in ${seasonText}, played by Hall of Masters players`
                        : 'Matches played by Hall of Masters players'
                }
            />

            <MatchFilters
                query={query}
                onChange={setQuery}
                options={filters.data}
                seasons={seasons.data?.seasons ?? []}
                liveSeason={seasons.data?.liveSeason}
                seasonId={seasonId}
                playerText={text}
                onPlayerText={setText}
                player2Text={text2}
                onPlayer2Text={setText2}
            />

            <div className='matches__summary'>
                <span aria-live='polite'>
                    {isFetching && isPlaceholderData
                        ? 'Searching…'
                        : page
                          ? `${formatNumber(page.total)} ${plural(page.total, 'match', 'matches')}`
                          : ''}
                </span>
                {filtering && (
                    <button
                        type='button'
                        className='text-link matches__clear'
                        onClick={clearFilters}
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {crawl?.isFetching && crawl.progress && (
                <p className='matches__crawl' role='status'>
                    Collecting new matches: {formatNumber(crawl.progress.done)} of{' '}
                    {formatNumber(crawl.progress.total)} players checked
                    {crawl.inserted > 0 ? `, ${formatNumber(crawl.inserted)} new so far` : ''}.
                </p>
            )}
            {crawl && !crawl.isFetching && crawl.lastRunEndedAt && (
                <p className='matches__crawl'>
                    Last checked for new matches {timeAgo(crawl.lastRunEndedAt)}.
                </p>
            )}

            {error && <ErrorState error={error} onRetry={() => refetch()} />}

            {page && matches.length === 0 && (
                <StatusMessage
                    title={filtering ? 'No matches found' : 'No matches recorded yet'}
                    action={
                        filtering && (
                            <button
                                type='button'
                                className='button button--quiet'
                                onClick={clearFilters}
                            >
                                Clear filters
                            </button>
                        )
                    }
                >
                    {filtering
                        ? 'No recorded match fits all these filters. Remove one to widen the search.'
                        : 'Matches appear here as the server collects them from Hall of Masters players.'}
                </StatusMessage>
            )}

            {matches.length > 0 && (
                <MatchList
                    matches={matches}
                    onPick={pick}
                    showSeason={query.season === 'all'}
                    className={
                        isPlaceholderData ? 'matches__list matches__list--stale' : 'matches__list'
                    }
                />
            )}

            {hasNextPage && page && (
                <button
                    type='button'
                    className='button button--quiet matches__more'
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                >
                    {isFetchingNextPage
                        ? 'Loading…'
                        : `Show ${Math.min(page.limit, page.total - matches.length)} more`}
                </button>
            )}
        </Page>
    );
}
