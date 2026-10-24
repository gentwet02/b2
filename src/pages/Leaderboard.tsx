import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';
import Page from '@/components/page/Page';
import PageHeader from '@/components/page/PageHeader';
import SeasonSelect from '@/components/season-select/SeasonSelect';
import {
    LEADERBOARD_DEFAULT_SIZE,
    LEADERBOARD_MIN_GAMES_DEFAULT,
    LEADERBOARD_REFRESH_THROTTLE_MS,
    LEADERBOARD_SORT_DEFAULT,
} from '@/config/leaderboard';
import LeaderboardFilters from '@/features/leaderboard/LeaderboardFilters';
import LeaderboardScore from '@/features/leaderboard/LeaderboardScore';
import { queryKeys } from '@/hooks/queries/keys';
import useLeaderboard from '@/hooks/queries/useLeaderboard';
import useSeasons from '@/hooks/queries/useSeasons';
import useThrottle from '@/hooks/useThrottle';
import type { LeaderboardView } from '@/types/leaderboard';
import type { TableState, TableStateCause } from '@/types/table';
import { formatNumber, timeAgo } from '@/utils/format';
import { seasonLabel } from '@/utils/season';

const routeApi = getRouteApi('/leaderboard/$season');

export default function Leaderboard() {
    const { season } = routeApi.useParams();
    const navigate = routeApi.useNavigate();
    const search = routeApi.useSearch();
    const queryClient = useQueryClient();

    const seasons = useSeasons();
    const known = seasons.data?.seasons ?? [];
    const liveSeason = seasons.data?.liveSeason;
    const current = known.find((s) => s.id === season);
    const live = current?.live ?? season === liveSeason;

    const { data } = useLeaderboard(season, live);
    const isFetching = useIsFetching({ queryKey: queryKeys.leaderboard(season) }) > 0;

    const refresh = useThrottle({
        callback: () => queryClient.invalidateQueries({ queryKey: queryKeys.leaderboard(season) }),
        delay: LEADERBOARD_REFRESH_THROTTLE_MS,
    });

    const view = {
        sort: search.sort ?? LEADERBOARD_SORT_DEFAULT,
        reverse: !!search.reverse,
        minGames: search.min ?? LEADERBOARD_MIN_GAMES_DEFAULT,
    } satisfies Required<LeaderboardView>;

    const onViewChange = (patch: LeaderboardView) => {
        const next = { ...view, ...patch };
        navigate({
            search: (prev) => ({
                ...prev,
                sort: next.sort !== LEADERBOARD_SORT_DEFAULT ? next.sort : undefined,
                reverse: next.reverse ? true : undefined,
                min: next.minGames !== LEADERBOARD_MIN_GAMES_DEFAULT ? next.minGames : undefined,
                page: undefined,
            }),
            replace: true,
            resetScroll: false,
        });
    };

    const onTableStateChange = (next: TableState, cause: TableStateCause) =>
        navigate({
            search: (prev) => ({
                ...prev,
                page: next.page > 1 ? next.page : undefined,
                size: next.pageSize !== LEADERBOARD_DEFAULT_SIZE ? next.pageSize : undefined,
                q: next.search || undefined,
            }),
            // typing in the search box: one history entry
            replace: cause === 'search',
            resetScroll: false,
        });

    const count = data?.data?.length;
    const updated = timeAgo(data?.lastUpdated);

    return (
        <Page className='leaderboard'>
            <PageHeader
                title={
                    <>
                        {current?.name ?? seasonLabel(season)}
                        {live && <span className='leaderboard__live'>Live</span>}
                    </>
                }
                subtitle={
                    count !== undefined ? (
                        <>
                            <span className='leaderboard__subtitle-part'>
                                {formatNumber(count)} players in the Hall of Masters
                                {updated && ','}
                            </span>
                            {updated && (
                                <>
                                    {' '}
                                    <span className='leaderboard__subtitle-part'>
                                        updated {updated}
                                    </span>
                                </>
                            )}
                        </>
                    ) : (
                        'Hall of Masters leaderboard'
                    )
                }
                actions={
                    <>
                        {known.length > 1 && (
                            <SeasonSelect
                                className='leaderboard__season'
                                seasons={known}
                                liveSeason={liveSeason}
                                value={season}
                                onChange={(next) =>
                                    navigate({
                                        params: { season: next },
                                        search: (prev) => ({ ...prev, page: undefined }),
                                    })
                                }
                            />
                        )}
                        <button
                            type='button'
                            onClick={() => refresh()}
                            className='button'
                            disabled={isFetching}
                        >
                            {isFetching ? 'Refreshing…' : 'Refresh'}
                        </button>
                    </>
                }
            />
            <LeaderboardScore
                key={season}
                season={season}
                live={live}
                view={view}
                onViewChange={onViewChange}
                controls={<LeaderboardFilters view={view} onChange={onViewChange} />}
                itemsPerPage={LEADERBOARD_DEFAULT_SIZE}
                tableState={{ page: search.page, pageSize: search.size, search: search.q }}
                onTableStateChange={onTableStateChange}
            />
        </Page>
    );
}
