import { ErrorState, Loading } from '@/components/status/Status';
import LeaderboardScore from '@/features/LeaderboardScore';
import Podium from '@/features/Podium';
import useLeaderboardStats from '@/hooks/useLeaderboardStats';
import { useRankedPlayers } from '@/hooks/useRankedPlayers';
import useSeasons from '@/hooks/useSeasons';
import { formatNumber, seasonLabel, timeAgo } from '@/utils/format';
import { Link } from '@tanstack/react-router';

export default function Home() {
    const seasons = useSeasons();
    const liveSeason = seasons.data?.liveSeason;
    const { players, data, isLoading, error, refetch } = useRankedPlayers(liveSeason, true);
    const { data: stats } = useLeaderboardStats(liveSeason);

    if (seasons.isLoading) return <Loading label='Finding the live season…' />;
    if (seasons.error || liveSeason === undefined) {
        return (
            <main className='page'>
                <ErrorState
                    title='Could not reach the server'
                    error={seasons.error}
                    onRetry={() => seasons.refetch()}
                />
            </main>
        );
    }

    const seasonName = seasons.data?.liveSeasonName ?? seasonLabel(liveSeason);
    const updated = timeAgo(data?.lastUpdated);

    return (
        <main className='page home'>
            <section className='home__hero' aria-labelledby='home-title'>
                <div className='home__intro'>
                    <h1 id='home-title' className='home__title'>
                        {seasonName} Hall of Masters
                    </h1>
                    <p className='home__lede'>
                        {players.length > 0
                            ? `${formatNumber(players.length)} players ranked${updated ? `, updated ${updated}` : ''}.`
                            : 'Live rankings from Bloons TD Battles 2.'}
                    </p>
                </div>
                <div className='home__stage'>
                    {isLoading && <Loading label='Loading leaderboard…' />}
                    {error && <ErrorState error={error} onRetry={() => refetch()} />}
                    {players.length > 0 && <Podium players={players} avatars={stats?.avatars} />}
                </div>
            </section>

            {players.length > 3 && (
                <section className='home__section' aria-labelledby='home-next'>
                    <div className='page__head'>
                        <h2 id='home-next' className='home__section-title'>
                            Ranks 4 to 13
                        </h2>
                        <div className='page__actions'>
                            <Link to='/matches-history' className='button button--quiet'>
                                Recent matches
                            </Link>
                            <Link
                                to='/leaderboard/$season'
                                params={{ season: liveSeason }}
                                className='button'
                            >
                                Full leaderboard
                            </Link>
                        </div>
                    </div>
                    <LeaderboardScore season={liveSeason} live range={[4, 13]} />
                </section>
            )}
        </main>
    );
}
