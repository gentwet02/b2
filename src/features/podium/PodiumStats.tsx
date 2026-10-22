import { formatNumber, winRate } from '@/utils/format';

/** Revealed under the rank number when the step lifts on hover. */
export default function PodiumStats({ record }: { record?: [number, number, number] | undefined }) {
    const [wins, losses, draws] = record ?? [0, 0, 0];
    const games = wins + losses + draws;
    const rate = winRate(wins, losses);

    return (
        <dl className='podium__stats'>
            <div>
                <dt>{games === 1 ? 'game' : 'games'}</dt>
                <dd>{record ? formatNumber(games) : '–'}</dd>
            </div>
            <div>
                <dt>win rate</dt>
                <dd>{rate === null ? '–' : `${rate.toFixed(1)}%`}</dd>
            </div>
        </dl>
    );
}
