import MatchCard from '@/components/match/MatchCard';
import { ErrorState, Loading, StatusMessage } from '@/components/status/Status';
import MatchFilters from '@/features/match/MatchFilters';
import useDebouncedValue from '@/hooks/useDebouncedValue';
import useMatchFilters from '@/hooks/useMatchFilters';
import useMatchesHistory from '@/hooks/useMatchesHistory';
import useSeasons from '@/hooks/useSeasons';
import type { MatchesQuery, MatchPick } from '@/types/match';
import {
    formatNumber,
    joinList,
    mapKey,
    parseHero,
    seasonLabel,
    splitList,
    timeAgo,
} from '@/utils/format';
import { getRouteApi } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

const routeApi = getRouteApi('/matches-history');

export default function MatchesHistory() {
    const query = routeApi.useSearch();
    const navigate = routeApi.useNavigate();

    const setQuery = (patch: Partial<MatchesQuery>) =>
        navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

    // the name box updates the URL once typing pauses
    const [text, setText] = useState(query.player ?? '');
    const debounced = useDebouncedValue(text.trim(), 300);
    useEffect(() => {
        if (debounced !== (query.player ?? '')) setQuery({ player: debounced || undefined });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced]);
    useEffect(() => {
        // the URL changed by itself (Back, Clear filters): show it in the box
        if ((query.player ?? '') !== debounced) setText(query.player ?? '');
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.player]);

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
    const filtering = !!(query.player || query.heroes || query.towers || query.map);
    const seasonId = page?.seasonId ?? query.season ?? seasons.data?.liveSeason;
    const options = filters.data;

    // clicking a hero, tower or map on a card adds it to the filters
    const pick = ({ kind, value }: MatchPick) => {
        if (kind === 'map') {
            setQuery({ map: mapKey(value) });
        } else if (kind === 'tower') {
            const towers = splitList(query.towers);
            if (towers.includes(value) || towers.length >= (options?.maxTowers ?? 6)) return;
            setQuery({ towers: joinList([...towers, value]) });
        } else {
            const base = options?.heroes.find((h) =>
                h.variants.some((v) => v.hero === value),
            )?.base;
            const heroes = splitList(query.heroes);
            const item = base ?? (value.includes('_') ? `${value.split('_')[0]}:${value}` : value);
            const itemBase = parseHero(item).base;
            if (
                heroes.some((h) => parseHero(h).base === itemBase) ||
                heroes.length >= (options?.maxHeroes ?? 2)
            )
                return;
            setQuery({ heroes: joinList([...heroes, item]) });
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setText('');
        setQuery({
            player: undefined,
            heroes: undefined,
            towers: undefined,
            map: undefined,
            sameSide: undefined,
        });
    };

    if (isLoading) return <Loading label='Loading matches…' />;

    return (
        <main className='page matches'>
            <div className='page__head'>
                <div>
                    <h1 className='page__title'>Ranked matches</h1>
                    <p className='page__subtitle'>
                        {page
                            ? `${formatNumber(page.totalMatches)} matches recorded in ${seasonId !== undefined ? seasonLabel(seasonId) : 'this season'}, played by Hall of Masters players`
                            : 'Matches played by Hall of Masters players'}
                    </p>
                </div>
            </div>

            <MatchFilters
                query={query}
                onChange={setQuery}
                options={options}
                seasons={seasons.data?.seasons ?? []}
                liveSeason={seasons.data?.liveSeason}
                seasonId={seasonId}
                playerText={text}
                onPlayerText={setText}
            />

            <div className='matches__summary'>
                <span aria-live='polite'>
                    {isFetching && isPlaceholderData
                        ? 'Searching…'
                        : page
                          ? `${formatNumber(page.total)} ${page.total === 1 ? 'match' : 'matches'}`
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
                <ul className={`matches__list${isPlaceholderData ? ' matches__list--stale' : ''}`}>
                    {matches.map((match) => (
                        <li key={match.id}>
                            <MatchCard match={match} onPick={pick} />
                        </li>
                    ))}
                </ul>
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
                        : `Show ${Math.min(20, page.total - matches.length)} more`}
                </button>
            )}
        </main>
    );
}
