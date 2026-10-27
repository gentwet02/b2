import Panel from '@/components/panel/Panel';
import RecordTable from '@/components/record-table/RecordTable';
import type { Comparison, CompareSeasonRow, RankBounds } from '@/types/compare';
import { formatNumber, timeAgo } from '@/utils/format';
import { gamesOf } from '@/utils/record';
import { incompleteMark, seasonTitle } from '@/utils/season';

interface VersusSeasonsProps {
    data: Comparison;
}

const ranks = (bounds: RankBounds | null) =>
    bounds ? `${formatNumber(bounds.from)}–${formatNumber(bounds.to)}` : '–';

/** All seasons: the record season by season (when there are two or more). */
export default function VersusSeasons(props: VersusSeasonsProps) {
    const { data } = props;

    const rows = data.seasons.filter((s) => gamesOf(s.record) > 0);
    if (data.season !== 'all' || rows.length < 2) return null;

    const bothGroups = data.a.mode === 'top' && data.b.mode === 'top';
    const columns = [
        ...(data.a.mode === 'top'
            ? [
                  {
                      title: bothGroups ? 'Left ranks' : 'Ranks',
                      numeric: true,
                      render: (s: CompareSeasonRow) => ranks(s.boundsA),
                  },
              ]
            : []),
        ...(data.b.mode === 'top'
            ? [
                  {
                      title: bothGroups ? 'Right ranks' : 'Ranks',
                      numeric: true,
                      render: (s: CompareSeasonRow) => ranks(s.bounds),
                  },
              ]
            : []),
    ];

    return (
        <Panel title='By season'>
            <RecordTable
                rows={rows}
                rowKey={(s) => String(s.seasonId)}
                label={{
                    title: 'Season',
                    render: (s) => `${seasonTitle(s.name)}${incompleteMark(s.seasonId)}`,
                    sort: (a, b) => a.seasonId - b.seasonId,
                }}
                initialSort='none'
                columns={columns}
                after={[
                    {
                        title: 'Last met',
                        render: (s) => (
                            <span className='record-table__soft'>{timeAgo(s.lastMet) ?? '–'}</span>
                        ),
                    },
                ]}
            />
        </Panel>
    );
}
