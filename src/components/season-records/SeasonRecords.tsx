import { useState } from 'react';
import Dropdown from '@/components/dropdown/Dropdown';
import Panel from '@/components/panel/Panel';
import RateBar from '@/components/rate-bar/RateBar';
import { PROFILE_SEASON_AMOUNTS } from '@/config/profile';
import type { SeasonRecord } from '@/types/record';
import { formatNumber, plural } from '@/utils/format';
import { recordTitle, winRate } from '@/utils/record';
import { seasonLabel } from '@/utils/season';

interface SeasonRecordsProps {
    /** newest first */
    seasons: SeasonRecord[];
    /** seasons a page shows */
    amount: number;
    onAmount: (amount: number) => void;
}

/** "Season by season": W–D–L and win rate of each season, newest first, more on demand. */
export default function SeasonRecords(props: SeasonRecordsProps) {
    const { seasons, amount, onAmount } = props;

    // "show more" pages, like the match history; a new amount starts over from one page
    const [pages, setPages] = useState({ amount, count: 1 });
    const pageCount = pages.amount === amount ? pages.count : 1;

    if (seasons.length === 0) return null;

    const shown = seasons.slice(0, amount * pageCount);
    const remaining = seasons.length - shown.length;

    return (
        <Panel
            title='Season by season'
            note={`${seasons.length} ${plural(seasons.length, 'season')}`}
            actions={
                seasons.length > (PROFILE_SEASON_AMOUNTS[0] ?? 0) && (
                    <div className='season-records__amount'>
                        <span aria-hidden='true'>Show</span>
                        <Dropdown
                            variant='compact'
                            className='season-records__amount-select'
                            aria-label='Seasons shown'
                            options={PROFILE_SEASON_AMOUNTS}
                            value={amount}
                            onSelect={onAmount}
                        />
                    </div>
                )
            }
        >
            <div className='season-records'>
                <table className='season-records__table'>
                    <thead>
                        <tr>
                            <th scope='col'>Season</th>
                            <th scope='col' className='season-records__num'>
                                W–D–L
                            </th>
                            <th scope='col' className='season-records__rate'>
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
                                    <td className='season-records__num'>
                                        {`${formatNumber(s.wins)}–${formatNumber(s.draws)}–${formatNumber(s.losses)}`}
                                    </td>
                                    <td className='season-records__rate'>
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
                <div className='season-records__actions'>
                    <button
                        type='button'
                        className='button--quiet'
                        onClick={() => setPages({ amount, count: pageCount + 1 })}
                    >
                        Show {Math.min(amount, remaining)} more
                    </button>
                </div>
            )}
        </Panel>
    );
}
