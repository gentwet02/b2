import type { Wld } from '@/types/record';
import { formatNumber, plural } from '@/utils/format';
import { formatRate, gamesOf, rateOf } from '@/utils/record';

interface PodiumStatsProps {
    record?: Wld | undefined;
}

/** Revealed under the rank number when the step lifts on hover. */
export default function PodiumStats(props: PodiumStatsProps) {
    const { record } = props;

    const games = gamesOf(record);

    return (
        <dl className='podium__stats'>
            <div>
                <dt>{plural(games, 'game')}</dt>
                <dd>{record ? formatNumber(games) : '–'}</dd>
            </div>
            <div>
                <dt>win rate</dt>
                <dd>{formatRate(rateOf(record), 1)}</dd>
            </div>
        </dl>
    );
}
