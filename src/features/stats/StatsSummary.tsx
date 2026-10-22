import Panel from '@/components/panel/Panel';
import Note from '@/components/text/Note';
import type { Stats } from '@/types/stats';
import { formatNumber, plural } from '@/utils/format';
import {
    formatRate,
    formatRecord,
    formatShare,
    gamesOf,
    rateOf,
    recordTitle,
    share,
} from '@/utils/record';
import { focusTitle, groupTitle } from '@/utils/statsTitles';
import StatsSummaryItem from './StatsSummaryItem';

interface StatsSummaryProps {
    data: Stats;
}

/** Win rate, record and pick rate of the focus (hero, towers, map) in the group. */
export default function StatsSummary(props: StatsSummaryProps) {
    const { data } = props;

    const groupGames = gamesOf(data.group);
    const games = gamesOf(data.selection);
    const focused = !!data.filters.hero || data.filters.towers.length > 0;
    const players =
        data.season !== 'all' && data.seasons[0]?.players != null ? data.seasons[0].players : null;
    const missing = data.missingSeasons.length;

    return (
        <Panel title={focusTitle(data)} note={groupTitle(data)}>
            <div className='stats-summary'>
                <StatsSummaryItem value={formatRate(rateOf(data.selection))} label='Win rate' />
                <StatsSummaryItem
                    value={games ? formatRecord(data.selection) : '–'}
                    title={recordTitle(data.selection)}
                    label={`in ${formatNumber(games)} ${plural(games, 'game')}`}
                />
                {focused && (
                    <StatsSummaryItem
                        value={formatShare(share(games, groupGames))}
                        label={`Pick rate, of ${formatNumber(groupGames)} games`}
                    />
                )}
                {players !== null && data.mode === 'top' && (
                    <StatsSummaryItem value={formatNumber(players)} label='Players counted' />
                )}
            </div>

            <Note>
                {data.mode === 'top' && data.season === 'all'
                    ? 'Each season counts its own players in this range.'
                    : null}
                {missing > 0 &&
                    ` ${missing} ${plural(missing, 'season is', 'seasons are')} skipped, their leaderboard isn't loaded yet.`}
            </Note>
        </Panel>
    );
}
