import { LEADERBOARD_DEFAULT_SIZE } from '@/config/leaderboard';
import LeaderboardScore from '@/features/LeaderboardScore';
import useLeaderboard, { leaderboardKey } from '@/hooks/useLeaderboard';
import useSeasons from '@/hooks/useSeasons';
import { useThrottle } from '@/hooks/useThrottle';
import type { TableState, TableStateCause } from '@/types/table';
import { formatNumber, seasonLabel, timeAgo } from '@/utils/format';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

const routeApi = getRouteApi('/leaderboard/$season');

export default function Leaderboard() {
    const { season } = routeApi.useParams();
    const navigate = routeApi.useNavigate();
    const search = routeApi.useSearch();
    const queryClient = useQueryClient();

    const seasons = useSeasons();
    const known = seasons.data?.seasons ?? [];
    const current = known.find((s) => s.id === season);
    const live = current?.live ?? season === seasons.data?.liveSeason;

    const { data } = useLeaderboard(season, live);
    const isFetching = useIsFetching({ queryKey: leaderboardKey(season) }) > 0;

    const refresh = useThrottle({
        callback: () => queryClient.invalidateQueries({ queryKey: leaderboardKey(season) }),
        delay: 2000,
    });

    const onTableStateChange = (next: TableState, cause: TableStateCause) =>
        navigate({
            search: {
                page: next.page > 1 ? next.page : undefined,
                size: next.pageSize !== LEADERBOARD_DEFAULT_SIZE ? next.pageSize : undefined,
                q: next.search || undefined,
            },
            replace: cause === 'search',
            resetScroll: false,
        });

    const count = data?.data?.length;
    const updated = timeAgo(data?.lastUpdated);

    return (
        <main className='page leaderboard'>
            <div className='page__head'>
                <div>
                    <h1 className='page__title'>
                        {current?.name ?? seasonLabel(season)}
                        {live && <span className='leaderboard__live'>Live</span>}
                    </h1>
                    <p className='page__subtitle'>
                        {count !== undefined
                            ? `${formatNumber(count)} players in the Hall of Masters${updated ? `, updated ${updated}` : ''}`
                            : 'Hall of Masters leaderboard'}
                    </p>
                </div>
                <div className='page__actions'>
                    {known.length > 1 && (
                        <label className='leaderboard__season'>
                            <span className='visually-hidden'>Season</span>
                            <select
                                className='select'
                                value={season}
                                onChange={(e) =>
                                    navigate({ params: { season: Number(e.target.value) } })
                                }
                            >
                                {known.map((s) => (
                                    <option key={s.id} value={s.id}>
                                        {s.name}
                                        {s.live ? ' (live)' : ''}
                                    </option>
                                ))}
                            </select>
                        </label>
                    )}
                    <button
                        type='button'
                        onClick={() => refresh()}
                        className='button'
                        disabled={isFetching}
                    >
                        {isFetching ? 'Refreshing…' : 'Refresh'}
                    </button>
                </div>
            </div>
            <LeaderboardScore
                key={season}
                season={season}
                live={live}
                itemsPerPage={LEADERBOARD_DEFAULT_SIZE}
                tableState={{
                    page: search.page,
                    pageSize: search.size,
                    search: search.q,
                }}
                onTableStateChange={onTableStateChange}
            />
        </main>
    );
}
