import { Link } from '@tanstack/react-router';
import Page from '@/components/page/Page';
import PageHeader from '@/components/page/PageHeader';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import LeaderboardScore from '@/features/leaderboard/LeaderboardScore';
import Podium from '@/features/podium/Podium';
import useLeaderboardStats from '@/hooks/queries/useLeaderboardStats';
import useRankedPlayers from '@/hooks/queries/useRankedPlayers';
import useSeasons from '@/hooks/queries/useSeasons';
import { formatNumber, timeAgo } from '@/utils/format';
import { seasonLabel, seasonTitle } from '@/utils/season';

export default function Home() {
    const seasons = useSeasons();
    const liveSeason = seasons.data?.liveSeason;
    const { players, data, isLoading, error, refetch } = useRankedPlayers(liveSeason, true);
    const { data: stats } = useLeaderboardStats(liveSeason);

    if (seasons.isLoading) return <Loading label='Finding the live season…' />;
    if (seasons.error || liveSeason === undefined) {
        return (
            <Page>
                <ErrorState
                    title='Could not reach the server'
                    error={seasons.error}
                    onRetry={() => seasons.refetch()}
                />
            </Page>
        );
    }

    const seasonName = seasons.data?.liveSeasonName
        ? seasonTitle(seasons.data.liveSeasonName)
        : seasonLabel(liveSeason);
    const updated = timeAgo(data?.lastUpdated);

    return (
        <Page className='home'>
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
                    {players.length > 0 && (
                        <Podium
                            players={players}
                            avatars={stats?.avatars}
                            records={stats?.records}
                        />
                    )}
                </div>
            </section>

            {players.length > 3 && (
                <section className='home__section' aria-labelledby='home-next'>
                    <PageHeader
                        actions={
                            <>
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
                            </>
                        }
                    />
                    <LeaderboardScore season={liveSeason} live range={[4, 25]} />
                </section>
            )}
        </Page>
    );
}
