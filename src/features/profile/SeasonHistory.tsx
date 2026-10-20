import Dropdown from '@/components/dropdown/Dropdown';
import { PROFILE_SEASON_AMOUNTS, PROFILE_SEASON_DEFAULT } from '@/config/profile';
import type { ProfileSeason } from '@/types/profile';
import { formatNumber, seasonLabel, winRate } from '@/utils/format';
import { getRouteApi } from '@tanstack/react-router';
import { useState } from 'react';

const routeApi = getRouteApi('/user/$userId');

/**
 * Every season we have profile readings for: W–D–L and win rate, newest first.
 * No best win streak here: readings from past seasons are too sparse to tell it, so it's only
 * shown for the live season (SeasonRecord) and all time (StatsPanel) for now.
 */
export default function SeasonHistory({ seasons }: { seasons: ProfileSeason[] }) {
    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    const amount = search.seasons ?? PROFILE_SEASON_DEFAULT;
    // "show more" pages, like the match history; a new amount starts over from one page
    const [pages, setPages] = useState({ amount, count: 1 });
    const pageCount = pages.amount === amount ? pages.count : 1;

    if (seasons.length === 0) return null;

    const shown = seasons.slice(0, amount * pageCount);
    const remaining = seasons.length - shown.length;
    const anyPartial = shown.some((s) => !s.complete);

    function setAmount(n: number) {
        navigate({
            search: (prev) => ({ ...prev, seasons: n === PROFILE_SEASON_DEFAULT ? undefined : n }),
            replace: true,
            resetScroll: false,
        });
    }

    return (
        <section className='profile-panel profile-panel--seasons'>
            <div className='profile-panel__head'>
                <h2 className='profile-panel__title'>Season by season</h2>
                <span className='profile-panel__note'>
                    {seasons.length} season{seasons.length === 1 ? '' : 's'}
                </span>
                {seasons.length > (PROFILE_SEASON_AMOUNTS[0] ?? 0) && (
                    <div className='season-history__amount'>
                        <span aria-hidden='true'>Show</span>
                        <Dropdown
                            variant='compact'
                            className='season-history__amount-select'
                            aria-label='Seasons shown'
                            options={PROFILE_SEASON_AMOUNTS}
                            value={amount}
                            onSelect={setAmount}
                        />
                    </div>
                )}
            </div>
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
                        </tr>
                    </thead>
                    <tbody>
                        {shown.map((s) => {
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
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
            {remaining > 0 && (
                <div className='season-history__actions'>
                    <button
                        type='button'
                        className='button button--quiet'
                        onClick={() => setPages({ amount, count: pageCount + 1 })}
                    >
                        Show {Math.min(amount, remaining)} more
                    </button>
                </div>
            )}
            {anyPartial && (
                <p className='season-history__note'>
                    * Counted from our first reading of the player in that season: earlier games of
                    that season are missing.
                </p>
            )}
        </section>
    );
}
