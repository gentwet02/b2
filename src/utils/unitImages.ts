import { heroKey } from '@/utils/hero';

/**
 * Our tower, hero, arena and bloon pictures (assets/images/towers, heroes, arena, bloons), found by NK's
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

/** "BananaFarm" → its picture */
export const towerPicture = (type: string): string | undefined => TOWERS[heroKey(type)];

/** "Quincy_Cyber" → the skin's picture, or the hero's when we have none for the skin */
export const heroPicture = (hero: string): string | undefined =>
    HEROES[heroKey(hero)] ?? HEROES[heroKey(hero.split('_')[0] ?? hero)];

/** NK's arena code ("hom", "zomg") → its logo */
export const arenaPicture = (arena: string): string | undefined => ARENAS[heroKey(arena)];

/** "Zebra", "MOAB" → its picture; decoys ("BFB_Decoy") look like their blimp */
export const bloonPicture = (type: string): string | undefined =>
    BLOONS[heroKey(type)] ?? BLOONS[heroKey(type.split('_')[0] ?? type)];
