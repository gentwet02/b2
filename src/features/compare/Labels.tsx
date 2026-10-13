import PlayerAvatar from '@/components/avatar/PlayerAvatar';
import usePlayerAvatar from '@/hooks/usePlayerAvatar';
import type { HeadToHead } from '@/types/compare';
import { heroImage, mapImage } from '@/utils/assetOverrides';
import { formatLoadout } from '@/utils/compare';
import { formatMap } from '@/utils/format';

type Labels = HeadToHead['labels'];

export function MapLabel({ mapKey, labels }: { mapKey: string; labels: Labels }) {
    const map = labels.maps[mapKey];
    const src = mapImage(map?.map, map?.image ?? undefined);
    return (
        <span className='cmp-label'>
            {src ? (
                <img className='cmp-label__map' src={src} alt='' loading='lazy' />
            ) : (
                <span className='cmp-label__map cmp-label__map--empty' aria-hidden='true' />
            )}
            <span className='cmp-label__text'>{formatMap(map?.map ?? mapKey)}</span>
        </span>
    );
}

export function LoadoutLabel({ loadoutKey, labels }: { loadoutKey: string; labels: Labels }) {
    const { hero, towers } = formatLoadout(loadoutKey);
    const base = loadoutKey.split('|')[0] ?? '';
    const heroLabel = labels.heroes[base];
    const src = heroImage(heroLabel?.hero ?? base, heroLabel?.portrait ?? undefined);
    return (
        <span className='cmp-label'>
            {src ? (
                <img className='cmp-label__hero' src={src} alt='' loading='lazy' />
            ) : (
                <span className='cmp-label__hero cmp-label__hero--empty' aria-hidden='true' />
            )}
            <span className='cmp-label__text'>
                {hero}
                <span className='cmp-label__sub'>{towers}</span>
            </span>
        </span>
    );
}

export function Avatar({ id, name, size = 32 }: { id: string; name: string; size?: number }) {
    const src = usePlayerAvatar(id);
    return (
        <span className='cmp-avatar' style={{ width: size, height: size, fontSize: size * 0.45 }}>
            <PlayerAvatar className='cmp-avatar__img' src={src} name={name} size={size} lazy />
        </span>
    );
}
