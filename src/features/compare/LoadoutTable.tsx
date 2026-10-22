import LoadoutLabel from '@/components/labels/LoadoutLabel';
import RecordTable from '@/components/record-table/RecordTable';
import type { H2hPick, Labels } from '@/types/compare';
import { loadoutName } from '@/utils/loadout';
import { byText } from '@/utils/sort';

interface LoadoutTableProps {
    rows: H2hPick[];
    labels: Labels;
}

/** Loadouts with their record, sortable by name. */
export default function LoadoutTable(props: LoadoutTableProps) {
    const { rows, labels } = props;

    return (
        <RecordTable
            rows={rows}
            rowKey={(l) => l.key}
            label={{
                title: 'Loadout',
                render: (l) => <LoadoutLabel loadoutKey={l.key} labels={labels} />,
                sort: byText((l) => loadoutName(l.key)),
            }}
        />
    );
}
