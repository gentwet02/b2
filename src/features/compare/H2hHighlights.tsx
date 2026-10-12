import type { H2hPick, H2hSummary, HeadToHead } from '@/types/compare';
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
import type { ReactNode } from 'react';

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

interface H2hHighlightsProps {
    summary: H2hSummary;
    labels: HeadToHead['labels'];
    /** games needed for a best / worst */
    min: number;
}

/**
 * Maps and loadouts of the games against one opponent (or all of them):
 * records are the profile player's, on their loadouts and against the opponent's.
 */
export default function H2hHighlights({ summary, labels, min }: H2hHighlightsProps) {
    const need = `Needs ${min}+ games on one`;
    return (
        <div className='h2h-highlights'>
            <H2hTile
                label='Best map'
                kind='map'
                pick={summary.best.map}
                labels={labels}
                empty={`${need} map`}
            />
            <H2hTile
                label='Your best loadout'
                kind='loadout'
                pick={summary.best.mine}
                labels={labels}
                empty={`${need} loadout`}
            />
            <H2hTile
                label='Their loadout you beat most'
                kind='loadout'
                pick={summary.best.theirs}
                labels={labels}
                empty={`${need} loadout of theirs`}
            />
            <H2hTile
                label='Worst map'
                kind='map'
                pick={summary.worst.map}
                labels={labels}
                empty={`${need} more map`}
            />
            <H2hTile
                label='Your worst loadout'
                kind='loadout'
                pick={summary.worst.mine}
                labels={labels}
                empty={`${need} more loadout`}
            />
            <H2hTile
                label='Their loadout that beats you'
                kind='loadout'
                pick={summary.worst.theirs}
                labels={labels}
                empty={`${need} more loadout of theirs`}
            />
        </div>
    );
}
