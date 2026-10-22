import { getRouteApi } from '@tanstack/react-router';
import { useState } from 'react';
import Dropdown from '@/components/dropdown/Dropdown';
import Panel from '@/components/panel/Panel';
import RateBar from '@/components/rate-bar/RateBar';
import { PROFILE_SEASON_AMOUNTS, PROFILE_SEASON_DEFAULT } from '@/config/profile';
import useSeasonRecords from '@/hooks/queries/useSeasonRecords';
import { formatNumber, plural } from '@/utils/format';
import { recordTitle, winRate } from '@/utils/record';
import { seasonLabel } from '@/utils/season';

const routeApi = getRouteApi('/user/$userId');

interface SeasonHistoryProps {
    userId: string;
}

/** W–D–L and win rate of every season we recorded the player in, newest first. */
export default function SeasonHistory(props: SeasonHistoryProps) {
    const { userId } = props;

    const { data } = useSeasonRecords(userId);
    const seasons = data ?? [];
    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    const amount = search.seasons ?? PROFILE_SEASON_DEFAULT;
    // "show more" pages, like the match history; a new amount starts over from one page
    const [pages, setPages] = useState({ amount, count: 1 });
    const pageCount = pages.amount === amount ? pages.count : 1;

    if (seasons.length === 0) return null;

    const shown = seasons.slice(0, amount * pageCount);
    const remaining = seasons.length - shown.length;

    function setAmount(n: number) {
        navigate({
            search: (prev) => ({ ...prev, seasons: n === PROFILE_SEASON_DEFAULT ? undefined : n }),
            replace: true,
            resetScroll: false,
        });
    }

    return (
        <Panel
            className='panel--seasons'
            title='Season by season'
            note={`${seasons.length} ${plural(seasons.length, 'season')}`}
            actions={
                seasons.length > (PROFILE_SEASON_AMOUNTS[0] ?? 0) && (
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
                )
            }
        >
            <div className='season-history'>
                <table className='season-history__table'>
                    <thead>
                        <tr>
                            <th scope='col'>Season</th>
                            <th scope='col' className='season-history__num'>
                                W–D–L
                            </th>
                            <th scope='col' className='season-history__rate'>
                                Win rate
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {shown.map((s) => {
                            const rate = winRate(s.wins, s.losses);
                            return (
                                <tr key={s.seasonId}>
                                    <th scope='row'>{seasonLabel(s.seasonId)}</th>
                                    <td className='season-history__num'>
                                        {`${formatNumber(s.wins)}–${formatNumber(s.draws)}–${formatNumber(s.losses)}`}
                                    </td>
                                    <td className='season-history__rate'>
                                        {rate === null ? (
                                            '–'
                                        ) : (
                                            <RateBar
                                                rate={rate}
                                                digits={1}
                                                title={recordTitle([s.wins, s.losses, s.draws])}
                                            />
                                        )}
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
        </Panel>
    );
}
