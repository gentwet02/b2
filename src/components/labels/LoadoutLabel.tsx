import type { Labels } from '@/types/compare';
import { heroImage } from '@/utils/assetOverrides';
import { formatLoadout } from '@/utils/loadout';
import ItemLabel from './ItemLabel';

interface LoadoutLabelProps {
    loadoutKey: string;
    labels: Labels;
}

/** "Quincy" over "Alchemist, Druid, Ninja Monkey", with the hero's portrait. */
export default function LoadoutLabel(props: LoadoutLabelProps) {
    const { loadoutKey, labels } = props;

    const { hero, towers } = formatLoadout(loadoutKey);
    const base = loadoutKey.split('|')[0] ?? '';
    const heroLabel = labels.heroes[base];
    return (
        <ItemLabel
            kind='hero'
            image={heroImage(heroLabel?.hero ?? base, heroLabel?.portrait ?? undefined)}
            sub={towers}
        >
            {hero}
        </ItemLabel>
    );
}
