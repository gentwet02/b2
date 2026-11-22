import type { Labels } from '@/types/compare';
import { heroThumb } from '@/utils/gamePictures';
import { formatLoadout, parseLoadout } from '@/utils/loadout';
import ItemLabel from './ItemLabel';
import LoadoutPictures from './LoadoutPictures';

interface LoadoutLabelProps {
    loadoutKey: string;
    labels: Labels;
    /** our hero and tower pictures in a row instead of the portrait, on wide screens */
    pictures?: boolean;
}

/**
 * "Quincy" over "Alchemist, Druid, Ninja Monkey", with the hero's picture on the left, or the
 * hero's and the towers' together on the right where there is room (`pictures`).
 */
export default function LoadoutLabel(props: LoadoutLabelProps) {
    const { loadoutKey, labels, pictures = false } = props;

    const { hero, towers } = formatLoadout(loadoutKey);
    const loadout = parseLoadout(loadoutKey);
    const { kind, image } = heroThumb(loadout.hero, labels.heroes[loadout.hero]?.portrait);
    return (
        <ItemLabel
            kind={kind}
            image={image}
            sub={towers}
            pictures={pictures ? <LoadoutPictures hero={loadout.hero} towers={loadout.towers} /> : undefined}
        >
            {hero}
        </ItemLabel>
    );
}
