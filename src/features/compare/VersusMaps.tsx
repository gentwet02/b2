import { useMemo } from 'react';
import MapLabel from '@/components/labels/MapLabel';
import Panel from '@/components/panel/Panel';
import RecordTable from '@/components/record-table/RecordTable';
import useSplitMaps from '@/hooks/useSplitMaps';
import type { Versus } from '@/types/compare';
import { formatMap, mergeMapVersions } from '@/utils/map';
import { pickList } from '@/utils/record';
import { byText } from '@/utils/sort';
import SplitMapsToggle from './SplitMapsToggle';

interface VersusMapsProps {
    data: Versus;
}

/** The record on each map, classic and reversed versions together unless split. */
export default function VersusMaps(props: VersusMapsProps) {
    const { data } = props;

    const [split] = useSplitMaps();
    const merged = useMemo(
        () => mergeMapVersions(data.total.maps, data.labels),
        [data.total.maps, data.labels],
    );
    const together = merged.hasReversed && !split;
    const rows = together ? pickList(merged.maps) : data.total.mapList;
    const labels = together ? merged.labels : data.labels;

    return (
        <Panel title='Maps' actions={merged.hasReversed && <SplitMapsToggle />}>
            <RecordTable
                className='record-table--split'
                rows={rows}
                rowKey={(m) => m.key}
                label={{
                    title: 'Map',
                    render: (m) => <MapLabel mapKey={m.key} labels={labels} />,
                    sort: byText((m) => formatMap(labels.maps[m.key]?.map ?? m.key)),
                }}
            />
        </Panel>
    );
}
