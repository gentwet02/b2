import { formatNumber } from '@/utils/format';
import { winRate } from '@/utils/record';

interface WinLossSummaryProps {
    wins: number;
    draws: number;
    losses: number;
}

/** The win rate, a bar of wins and draws, and the three counts. */
export default function WinLossSummary(props: WinLossSummaryProps) {
    const { wins, draws, losses } = props;

    const rate = winRate(wins, losses);
    const played = wins + losses + draws;
    const winShare = played > 0 ? (wins / played) * 100 : 0;
    const drawShare = played > 0 ? (draws / played) * 100 : 0;

    return (
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
                <span className='stats-panel__bar-draw' style={{ width: `${drawShare}%` }} />
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
        </>
    );
}
