import { ErrorState } from '@/components/status/Status';
import useSeasonStats from '@/hooks/useSeasonStats';
import { heroImage } from '@/utils/assetOverrides';
import { formatHero, formatNumber, winRate } from '@/utils/format';

/**
 * Ranked record for the live season: wins, losses and streaks from the profile readings our
 * server stores (every game counts), hero and match count from the matches it recorded.
 */
export default function SeasonRecord({ userId }: { userId: string }) {
    const { data, isLoading, error, refetch } = useSeasonStats(userId);

    const title = data?.seasonName ?? 'This season';

    if (isLoading) {
        return (
            <section
                className='stats-panel stats-panel--accent stats-panel--loading'
                aria-busy='true'
            >
                <h2 className='stats-panel__title'>This season</h2>
                <p className='profile-panel__empty'>Loading the season record…</p>
            </section>
        );
    }
    if (error || !data) {
        return (
            <section className='stats-panel'>
                <h2 className='stats-panel__title'>This season</h2>
                <ErrorState error={error} onRetry={() => refetch()} />
            </section>
        );
    }

    // the profile readings see every ranked game; the recorded matches only HoM vs HoM ones
    const { wins, losses, draws } = data.record ?? data;
    const played = wins + losses + draws;
    const rate = winRate(wins, losses);
    const winShare = played > 0 ? (wins / played) * 100 : 0;
    const drawShare = played > 0 ? (draws / played) * 100 : 0;
    const since =
        data.record && !data.record.complete
            ? new Date(data.record.firstSeen).toLocaleDateString(undefined, {
                  day: 'numeric',
                  month: 'short',
              })
            : null;
    const streak = (value: number | null) => (value === null ? '–' : formatNumber(value));
    const topHero = data.heroes[0];
    const topHeroPortrait = topHero ? heroImage(topHero.hero, topHero.portrait) : undefined;

    return (
        <section className='stats-panel stats-panel--accent'>
            <h2 className='stats-panel__title'>
                {title} <span className='stats-panel__tag'>Ranked</span>
            </h2>

            {played === 0 ? (
                <p className='profile-panel__empty'>
                    No ranked match recorded for this player this season yet.
                </p>
            ) : (
                <>
                    <div className='stats-panel__rate'>
                        <span className='stats-panel__rate-value'>
                            {rate === null ? 'No games' : `${rate.toFixed(1)}%`}
                        </span>
                        {rate !== null && <span className='stats-panel__rate-label'>win rate</span>}
                    </div>

                    <div
                        className='stats-panel__bar'
                        role='img'
                        aria-label={`${wins} wins, ${draws} draws, ${losses} losses`}
                    >
                        <span className='stats-panel__bar-win' style={{ width: `${winShare}%` }} />
                        <span
                            className='stats-panel__bar-draw'
                            style={{ width: `${drawShare}%` }}
                        />
                    </div>

                    <div className='stats-panel__record'>
                        <span>
                            <strong>{formatNumber(wins)}</strong> wins
                        </span>
                        <span>
                            <strong>{formatNumber(draws)}</strong> draws
                        </span>
                        <span>
                            <strong>{formatNumber(losses)}</strong> losses
                        </span>
                    </div>

                    {since && (
                        <p className='stats-panel__note'>
                            Counted since {since}, our first reading of this player this season.
                        </p>
                    )}

                    <dl className='stats-panel__details'>
                        <div className='stats-panel__detail'>
                            <dt>Current win streak</dt>
                            <dd>{streak(data.winStreak)}</dd>
                        </div>
                        <div className='stats-panel__detail'>
                            <dt>Best win streak</dt>
                            <dd>{streak(data.bestWinStreak)}</dd>
                        </div>
                        {topHero && (
                            <div className='stats-panel__detail'>
                                <dt>Most played hero</dt>
                                <dd className='stats-panel__hero'>
                                    {topHeroPortrait && (
                                        <img
                                            className='stats-panel__hero-img'
                                            src={topHeroPortrait}
                                            alt=''
                                        />
                                    )}
                                    <span>
                                        {formatHero(topHero.hero)}{' '}
                                        <span className='stats-panel__sub'>
                                            {topHero.wins}/{topHero.played} won
                                        </span>
                                    </span>
                                </dd>
                            </div>
                        )}
                        <div className='stats-panel__detail'>
                            <dt>Matches recorded</dt>
                            <dd>{formatNumber(data.recorded)}</dd>
                        </div>
                    </dl>
                </>
            )}
        </section>
    );
}
