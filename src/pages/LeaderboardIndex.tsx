import { ErrorState, Loading } from '@/components/status/Status';
import useSeasons from '@/hooks/useSeasons';
import { Navigate } from '@tanstack/react-router';

/** /leaderboard → the live season's leaderboard. */
export default function LeaderboardIndex() {
    const { data, isLoading, error, refetch } = useSeasons();

    if (isLoading) return <Loading label='Finding the live season…' />;
    if (error || !data) {
        return (
            <main className='page'>
                <ErrorState error={error} onRetry={() => refetch()} />
            </main>
        );
    }
    return <Navigate to='/leaderboard/$season' params={{ season: data.liveSeason }} replace />;
}
