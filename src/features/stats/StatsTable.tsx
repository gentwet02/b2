import RecordTable from '@/components/record-table/RecordTable';
import Note from '@/components/text/Note';
import type { StatsRow, StatsSearch, StatsTableSpec } from '@/types/stats';
import { formatNumber } from '@/utils/format';
import { formatShare, gamesOf, keepRows, share } from '@/utils/record';
import { byText } from '@/utils/sort';
import FocusButton from './FocusButton';

interface StatsTableProps {
    spec: StatsTableSpec;
    /** the group's games: what a row's pick rate is out of */
    groupGames: number;
    min: number;
    /** minimum pick rate, in % */
    minPick: number;
    /** what the table says when the minimums leave no row */
    empty: string;
    onFocus: (next: Partial<StatsSearch>) => void;
}

/** One picks table (heroes, towers or strats): record and pick rate, a focus per row. */
export default function StatsTable(props: StatsTableProps) {
    const { spec, groupGames, min, minPick, empty, onFocus } = props;
    const pickOf = (r: StatsRow) => share(gamesOf(r.record), groupGames) ?? 0;

    return (
        <>
            <RecordTable<StatsRow>
                className='stats-table'
                rows={keepRows(spec.rows, pickOf, min, minPick)}
                rowKey={(r) => r.key}
                label={{ title: spec.title, render: spec.render, sort: byText(spec.name) }}
                columns={[
                    {
                        title: 'Pick rate',
                        numeric: true,
                        render: (r) => formatShare(pickOf(r)),
                        sort: (a, b) => gamesOf(b.record) - gamesOf(a.record),
                    },
                ]}
                after={[
                    {
                        title: '',
                        render: (r) => <FocusButton next={spec.focus(r)} onFocus={onFocus} />,
                    },
                ]}
                empty={empty}
                pageSize={spec.pageSize}
            />
            {spec.cut && spec.cut.total > spec.rows.length && (
                <Note>
                    The {formatNumber(spec.rows.length)} most played of{' '}
                    {formatNumber(spec.cut.total)} {spec.cut.noun}.
                </Note>
            )}
        </>
    );
}
