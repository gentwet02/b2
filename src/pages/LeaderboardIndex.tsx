import { Navigate } from '@tanstack/react-router';
import Page from '@/components/page/Page';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import useSeasons from '@/hooks/queries/useSeasons';

/** /leaderboard → the live season's leaderboard. */
export default function LeaderboardIndex() {
    const { data, isLoading, error, refetch } = useSeasons();

    if (isLoading) return <Loading label='Finding the live season…' />;
    if (error || !data) {
        return (
            <Page>
                <ErrorState error={error} onRetry={() => refetch()} />
            </Page>
        );
    }
    return <Navigate to='/leaderboard/$season' params={{ season: data.liveSeason }} replace />;
}
