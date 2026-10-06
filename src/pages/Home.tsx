import LeaderboardScore from '@/features/LeaderboardScore';
import useSeasons from '@/hooks/useSeasons';

export default function Home() {
    const { data: liveSeason, isLoading, error } = useSeasons();

    if (isLoading) {
        return <>Loading...</>;
    }

    if (error || !liveSeason?.data) {
        return <>Error!</>;
    }

    return (
        <main className='home'>
            {liveSeason?.data?.liveSeason && (
                <div className='home__leaderboard'>
                    <LeaderboardScore season={liveSeason.data?.liveSeason} itemsPerPage={10} />
                </div>
            )}
        </main>
    );
}
