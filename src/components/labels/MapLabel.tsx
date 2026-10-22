import type { Labels } from '@/types/compare';
import { mapImage } from '@/utils/assetOverrides';
import { formatMap } from '@/utils/map';
import ItemLabel from './ItemLabel';

interface MapLabelProps {
    mapKey: string;
    labels: Labels;
}

export default function MapLabel(props: MapLabelProps) {
    const { mapKey, labels } = props;

    const map = labels.maps[mapKey];
    return (
        <ItemLabel kind='map' image={mapImage(map?.map, map?.image ?? undefined)}>
            {formatMap(map?.map ?? mapKey)}
        </ItemLabel>
    );
}
