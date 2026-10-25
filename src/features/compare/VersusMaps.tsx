import MapLabel from '@/components/labels/MapLabel';
import Panel from '@/components/panel/Panel';
import RecordTable from '@/components/record-table/RecordTable';
import { useSplitMaps } from '@/hooks/useSplitVariants';
import type { Versus } from '@/types/compare';
import { formatMap } from '@/utils/map';
import { byText } from '@/utils/sort';

interface VersusMapsProps {
    data: Versus;
}

/** The record on each map, classic and reversed versions apart unless the URL says otherwise. */
export default function VersusMaps(props: VersusMapsProps) {
    const { data } = props;

    const [split] = useSplitMaps();
    const { labels } = data;
    const rows = (split && data.total.mapVariantList) || data.total.mapList;

    return (
        <Panel title='Maps'>
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
