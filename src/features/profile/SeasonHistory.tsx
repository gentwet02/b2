import type { ProfileSeason } from '@/types/profile';
import { formatNumber, seasonLabel, winRate } from '@/utils/format';

/** Every season we have profile readings for: record and best win streak, newest first. */
export default function SeasonHistory({ seasons }: { seasons: ProfileSeason[] }) {
    if (seasons.length === 0) return null;
    const anyPartial = seasons.some((s) => !s.complete);

    return (
        <section className='profile-panel'>
            <h2 className='profile-panel__title'>Season by season</h2>
            <div className='season-history'>
                <table className='season-history__table'>
                    <thead>
                        <tr>
                            <th scope='col'>Season</th>
                            <th scope='col' className='season-history__num'>
                                W–D–L
                            </th>
                            <th scope='col' className='season-history__num'>
                                Win rate
                            </th>
                            <th scope='col' className='season-history__num'>
                                Best streak
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {seasons.map((s) => {
                            const rate = winRate(s.wins, s.losses);
                            // one reading and nothing before it: no record to show yet
                            const unknown = !s.complete && s.wins + s.draws + s.losses === 0;
                            return (
                                <tr key={s.seasonId}>
                                    <th scope='row'>
                                        {seasonLabel(s.seasonId)}
                                        {!s.complete && (
                                            <span
                                                className='season-history__mark'
                                                title='Counted from our first reading of this player in that season'
                                            >
                                                *
                                            </span>
                                        )}
                                    </th>
                                    <td className='season-history__num'>
                                        {unknown
                                            ? '–'
                                            : `${formatNumber(s.wins)}–${formatNumber(s.draws)}–${formatNumber(s.losses)}`}
                                    </td>
                                    <td className='season-history__num'>
                                        {rate === null ? '–' : `${rate.toFixed(1)}%`}
                                    </td>
                                    <td className='season-history__num'>
                                        {formatNumber(s.bestWinStreak)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {anyPartial && (
                <p className='season-history__note'>
                    * Counted from our first reading of the player in that season: earlier games of
                    that season are missing.
                </p>
            )}
        </section>
    );
}
