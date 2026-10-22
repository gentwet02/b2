import type { ReactNode } from 'react';
import type { H2hPick, HeadToHead } from '@/types/compare';
import { heroImage, mapImage } from '@/utils/assetOverrides';
import {
    formatLoadout,
    formatRate,
    formatRecord,
    gamesOf,
    rateOf,
    recordTitle,
} from '@/utils/compare';
import { formatMap } from '@/utils/format';

type Kind = 'map' | 'loadout';

interface TileProps {
    label: string;
    kind: Kind;
    pick: H2hPick | null;
    labels: HeadToHead['labels'];
    empty: string;
}

export function H2hTile({ label, kind, pick, labels, empty }: TileProps) {
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
