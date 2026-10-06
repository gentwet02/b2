import LeaderboardScore from '@/features/LeaderboardScore';
import { useThrottle } from '@/hooks/useThrottle';
import { useQueryClient } from '@tanstack/react-query';
import { getRouteApi } from '@tanstack/react-router';

const routeApi = getRouteApi('/leaderboard/$season');

export default function Leaderboard() {
    const { season } = routeApi.useParams();
    const queryClient = useQueryClient();

    const queryKey = [`leaderboard${season}`, season];
    const queryState = queryClient.getQueryState(queryKey);
    const isFetching = queryState?.fetchStatus === 'fetching';

    const refresh = useThrottle({
        callback: () => {
            queryClient.invalidateQueries({
                queryKey: queryKey,
            });
        },
        delay: 2000,
    });

    return (
        <div className='leaderboard'>
            <div className='leaderboard__header'>
                <h2 className='leaderboard__title'>Season {+season + 1} Leaderboard</h2>
                <button
                    onClick={refresh}
                    className='leaderboard__refresh-btn'
                    disabled={isFetching}
                >
                    {isFetching ? 'Refreshing...' : 'Refresh'}
                </button>
            </div>
            <LeaderboardScore season={season} />
        </div>
    );
}
