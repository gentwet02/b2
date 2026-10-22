import Panel from '@/components/panel/Panel';
import RecordTable from '@/components/record-table/RecordTable';
import type { Versus } from '@/types/compare';
import { formatNumber, timeAgo } from '@/utils/format';
import { gamesOf } from '@/utils/record';
import { seasonTitle } from '@/utils/season';

interface VersusSeasonsProps {
    data: Versus;
}

/** All seasons: the record season by season (when there are two or more). */
export default function VersusSeasons(props: VersusSeasonsProps) {
    const { data } = props;

    const rows = data.seasons.filter((s) => gamesOf(s.record) > 0);
    if (data.season !== 'all' || rows.length < 2) return null;

    return (
        <Panel title='By season'>
            <RecordTable
                rows={rows}
                rowKey={(s) => String(s.seasonId)}
                label={{
                    title: 'Season',
                    render: (s) => seasonTitle(s.name),
                    sort: (a, b) => a.seasonId - b.seasonId,
                }}
                initialSort='none'
                columns={
                    data.mode === 'top'
                        ? [
                              {
                                  title: 'Ranks',
                                  numeric: true,
                                  render: (s) =>
                                      s.bounds
                                          ? `${formatNumber(s.bounds.from)}–${formatNumber(s.bounds.to)}`
                                          : '–',
                              },
                          ]
                        : []
                }
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
