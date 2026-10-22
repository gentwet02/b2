import type { ReactNode } from 'react';
import type { H2hPick, H2hTileKind, Labels } from '@/types/compare';
import { heroImage, mapImage } from '@/utils/assetOverrides';
import { formatLoadout } from '@/utils/loadout';
import { formatMap } from '@/utils/map';
import { formatRate, formatRecord, gamesOf, rateOf, recordTitle } from '@/utils/record';

interface H2hTileProps {
    label: string;
    kind: H2hTileKind;
    pick: H2hPick | null;
    labels: Labels;
    empty: string;
}

/** One best / worst map or loadout, with its record. */
export default function H2hTile(props: H2hTileProps) {
    const { label, kind, pick, labels, empty } = props;

    if (!pick) {
        return (
            <div className='h2h-tile h2h-tile--empty'>
                <span className='h2h-tile__label'>{label}</span>
                <span className='h2h-tile__none'>{empty}</span>
            </div>
        );
    }

    let title: ReactNode;
    let image: string | undefined;
    if (kind === 'map') {
        const map = labels.maps[pick.key];
        title = formatMap(map?.map ?? pick.key);
        image = mapImage(map?.map, map?.image ?? undefined);
    } else {
        const { hero, towers } = formatLoadout(pick.key);
        const base = pick.key.split('|')[0] ?? '';
        const heroLabel = labels.heroes[base];
        image = heroImage(heroLabel?.hero ?? base, heroLabel?.portrait ?? undefined);
        title = (
            <>
                {hero}
                <span className='h2h-tile__towers'>{towers}</span>
            </>
        );
    }

    return (
        <div className={`h2h-tile h2h-tile--${kind}`}>
            {image && <img className='h2h-tile__img' src={image} alt='' loading='lazy' />}
            <span className='h2h-tile__label'>{label}</span>
            <span className='h2h-tile__title'>{title}</span>
            <span className='h2h-tile__line' title={recordTitle(pick.record)}>
                <strong>{formatRecord(pick.record)}</strong> · {formatRate(rateOf(pick.record))}
                {gamesOf(pick.record) === 1 ? ' · 1 game' : ''}
            </span>
        </div>
    );
}
