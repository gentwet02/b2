import type { ReactNode } from 'react';
import { heroImage } from '@/utils/assetOverrides';
import { formatHero } from '@/utils/hero';
import ItemLabel from './ItemLabel';

interface HeroLabelProps {
    /** a hero base ("Quincy") or a variant ("Quincy_Cyber") */
    hero: string;
    /** the raw hero the picture is of, when it's not `hero` */
    pictured?: string | undefined;
    portrait: string | null | undefined;
    sub?: ReactNode;
}

export default function HeroLabel(props: HeroLabelProps) {
    const { hero, pictured, portrait, sub } = props;

    return (
        <ItemLabel kind='hero' image={heroImage(pictured ?? hero, portrait ?? undefined)} sub={sub}>
            {formatHero(hero)}
        </ItemLabel>
    );
}
