import { HOM_MEDAL_FILES } from '@/config/medals';
import { heroImage } from '@/utils/assetOverrides';
import { heroKey } from '@/utils/hero';

/**
 * Our tower, hero, arena, bloon and medal pictures (assets/images/towers, heroes, arena, bloons,
 * medals), found by NK's
 * names: a file matches when both read the same lowercase without underscores
 * ("Ezili_SmudgeCat" ↔ ezili_smudge_cat.webp, "BananaFarm" ↔ banana_farm.webp, "hom" ↔ hom.webp).
 */
function byName(files: Record<string, string>): Record<string, string> {
    return Object.fromEntries(
        Object.entries(files).map(([path, url]) => [
            heroKey((path.split('/').pop() ?? path).replace(/\.\w+$/, '')),
            url,
        ]),
    );
}

const TOWERS = byName(
    import.meta.glob<string>('../assets/images/towers/*.webp', { eager: true, import: 'default' }),
);
const HEROES = byName(
    import.meta.glob<string>('../assets/images/heroes/*.webp', { eager: true, import: 'default' }),
);
const BLOONS = byName(
    import.meta.glob<string>('../assets/images/bloons/*.webp', { eager: true, import: 'default' }),
);
const ARENAS = byName(
    import.meta.glob<string>('../assets/images/arena/*.webp', { eager: true, import: 'default' }),
);
const MEDALS = byName(
    import.meta.glob<string>('../assets/images/medals/*.webp', { eager: true, import: 'default' }),
);

/** "BananaFarm" → its picture */
export const towerPicture = (type: string): string | undefined => TOWERS[heroKey(type)];

/** "Quincy_Cyber" → the skin's picture, or the hero's when we have none for the skin */
export const heroPicture = (hero: string): string | undefined =>
    HEROES[heroKey(hero)] ?? HEROES[heroKey(hero.split('_')[0] ?? hero)];

/**
 * A medal's NK badge name → its picture: the Hall of Masters' by tier ("Arena_Master_Top100",
 * HOM_MEDAL_FILES), the other arenas' by their code ("Arena_MOAB" ↔ season_medal_moab.webp).
 */
export function medalPicture(name: string): string | undefined {
    const arena = /^Arena_([A-Za-z]+)$/.exec(name)?.[1];
    const file = HOM_MEDAL_FILES[name] ?? (arena && `season_medal_${arena}`);
    return file ? MEDALS[heroKey(file)] : undefined;
}

/** NK's arena code ("hom", "zomg") → its logo */
export const arenaPicture = (arena: string): string | undefined => ARENAS[heroKey(arena)];

/** "Zebra", "MOAB" → its picture; decoys ("BFB_Decoy") look like their blimp */
export const bloonPicture = (type: string): string | undefined =>
    BLOONS[heroKey(type)] ?? BLOONS[heroKey(type.split('_')[0] ?? type)];

/** A hero's thumbnail: our picture of it, or NK's round portrait when we have none. */
export function heroThumb(hero: string, portrait?: string | null) {
    const picture = heroPicture(hero);
    return picture
        ? { kind: 'hero' as const, image: picture }
        : { kind: 'portrait' as const, image: heroImage(hero, portrait ?? undefined) };
}
