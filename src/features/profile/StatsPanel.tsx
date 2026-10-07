import type { Stats } from '@/types/profile';
import { formatNumber, winRate } from '@/utils/format';
import type { ReactNode } from 'react';

interface StatsPanelProps {
    title: string;
    stats: Stats;
    accent?: boolean;
    /** extra rows, e.g. best season finish */
    extra?: { label: string; value: ReactNode }[];
}

export default function StatsPanel({ title, stats, accent = false, extra = [] }: StatsPanelProps) {
    const rate = winRate(stats.wins, stats.losses);
    const played = stats.wins + stats.losses + stats.draws;
    const winShare = played > 0 ? (stats.wins / played) * 100 : 0;
    const drawShare = played > 0 ? (stats.draws / played) * 100 : 0;

    const details = [
        { label: 'Current win streak', value: stats.win_streak },
        { label: 'Best win streak', value: stats.highest_win_streak },
        { label: 'Wins without losing a life', value: stats.no_lives_lost },
        { label: 'First bloon popped', value: stats.first_bloons },
    ];

    return (
        <section className={`stats-panel${accent ? ' stats-panel--accent' : ''}`}>
            <h2 className='stats-panel__title'>{title}</h2>

            <div className='stats-panel__rate'>
                <span className='stats-panel__rate-value'>
                    {rate === null ? 'No games' : `${rate.toFixed(1)}%`}
                </span>
                {rate !== null && <span className='stats-panel__rate-label'>win rate</span>}
            </div>

            <div
                className='stats-panel__bar'
                role='img'
                aria-label={`${stats.wins} wins, ${stats.draws} draws, ${stats.losses} losses`}
            >
                <span className='stats-panel__bar-win' style={{ width: `${winShare}%` }} />
                <span className='stats-panel__bar-draw' style={{ width: `${drawShare}%` }} />
            </div>

            <div className='stats-panel__record'>
                <span>
                    <strong>{formatNumber(stats.wins)}</strong> wins
                </span>
                <span>
                    <strong>{formatNumber(stats.draws)}</strong> draws
                </span>
                <span>
                    <strong>{formatNumber(stats.losses)}</strong> losses
                </span>
            </div>

            <dl className='stats-panel__details'>
                {details.map((d) => (
                    <div key={d.label} className='stats-panel__detail'>
                        <dt>{d.label}</dt>
                        <dd>{formatNumber(d.value ?? 0)}</dd>
                    </div>
                ))}
                {extra.map((d) => (
                    <div key={d.label} className='stats-panel__detail'>
                        <dt>{d.label}</dt>
                        <dd>{d.value}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}
