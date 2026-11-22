import MapLabel from '@/components/labels/MapLabel';
import RecordTable from '@/components/record-table/RecordTable';
import type {
    Stats,
    StatsMapStratRow,
    StatsRow,
    StatsSearch,
    StatsTableSpec,
} from '@/types/stats';
import { bem } from '@/utils/className';
import { formatMap } from '@/utils/map';
import { formatShare, gamesOf, share } from '@/utils/record';
import { byText } from '@/utils/sort';
import FocusButton from './FocusButton';

interface MapStratsTableProps {
    /** one per map: its most played strat */
    rows: StatsMapStratRow[];
    labels: Stats['labels'];
    /** the strats table shown on the strats tab: how a strat reads and focuses */
    strat: StatsTableSpec;
    /** a row's map → the map filter that focuses it */
    mapFocus: (key: string) => string;
    onFocus: (next: Partial<StatsSearch>) => void;
}

/**
 * One row per map: the strat played most there, its record and pick rate on that map. Every
 * map is listed: the minimum games and pick rate are for the other tables.
 */
export default function MapStratsTable(props: MapStratsTableProps) {
    const { rows, labels, strat, mapFocus, onFocus } = props;
    // the strat as a strats table row, to read and focus it the same way
    const stratOf = (r: StatsMapStratRow): StatsRow => ({ key: r.strat, record: r.record });
    const pickOf = (r: StatsMapStratRow) => share(gamesOf(r.record), r.total) ?? 0;

    return (
        <RecordTable<StatsMapStratRow>
            className={bem('stats-table', 'map-strats')}
            rows={rows}
            rowKey={(r) => r.key}
            label={{
                title: 'Map',
                render: (r) => <MapLabel mapKey={r.key} labels={labels} />,
                sort: byText((r) => formatMap(labels.maps[r.key]?.map ?? r.key)),
            }}
            columns={[
                {
                    title: strat.title,
                    className: 'stats-table__strat',
                    render: (r) => strat.render(stratOf(r)),
                    sort: byText((r) => strat.name(stratOf(r))),
                },
                {
                    title: 'Pick rate',
                    numeric: true,
                    render: (r) => formatShare(pickOf(r)),
                    sort: (a, b) => pickOf(b) - pickOf(a),
                },
            ]}
            after={[
                {
                    title: '',
                    render: (r) => (
                        <FocusButton
                            next={{ ...strat.focus(stratOf(r)), map: mapFocus(r.key) }}
                            onFocus={onFocus}
                        />
                    ),
                },
            ]}
            empty='No map strat here.'
        />
    );
}
