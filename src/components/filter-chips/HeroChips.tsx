import { Fragment } from 'react';
import Dropdown from '@/components/dropdown/Dropdown';
import ChipAdder from '@/components/filter-chips/ChipAdder';
import ChipClear from '@/components/filter-chips/ChipClear';
import FilterChip from '@/components/filter-chips/FilterChip';
import type { ChipExclusion } from '@/types/filter';
import type { HeroPick } from '@/types/hero';
import type { SideFilterOptions } from '@/types/match';
import { heroImage } from '@/utils/assetOverrides';
import { formatNumber } from '@/utils/format';
import { formatHero } from '@/utils/hero';

interface HeroChipsProps {
    heroes: HeroPick[];
    max: number;
    options?: SideFilterOptions | undefined;
    onChange: (next: HeroPick[]) => void;
    /** heroes nobody plays (no exclude select without it) */
    exclude?: ChipExclusion<HeroPick> | undefined;
    /** empties the picks and the exclusions in one change (shown from 2 chips) */
    onClear?: (() => void) | undefined;
}

/**
 * Portraits seen in the options, by hero. Excluded heroes drop out of the options
 * (0 games left), so their chips use the portrait seen before.
 */
const portraits = new Map<string, string>();

/** Heroes filtered on ("vs" between two), each with any variant or one, and heroes left out. */
export default function HeroChips(props: HeroChipsProps) {
    const { heroes, max, options, onChange, exclude, onClear } = props;
    const excluded = exclude?.items ?? [];

    for (const h of options?.heroes ?? []) {
        for (const v of h.variants) if (v.portrait) portraits.set(v.hero, v.portrait);
    }

    // a hero is either included or excluded, never both
    const taken = (base: string) =>
        heroes.some((p) => p.base === base) || excluded.some((p) => p.base === base);
    const addOptions = (options?.heroes ?? [])
        .filter((h) => h.count > 0 && !taken(h.base))
        .map((h) => ({ value: h.base, label: `${formatHero(h.base)} (${formatNumber(h.count)})` }));

    const setVariant = (base: string, hero: string) =>
        onChange(heroes.map((h) => (h.base === base ? (hero ? { base, hero } : { base }) : h)));

    const canAdd = heroes.length < max;
    const canExclude = !!exclude && excluded.length < exclude.max && addOptions.length > 0;
    const canClear = !!onClear && heroes.length + excluded.length >= 2;
    const hasChips = heroes.length > 0 || excluded.length > 0;

    return (
        <div className='filter-chips'>
            {(canAdd || canExclude || canClear) && (
                <div className='filter-chips__selectors'>
                    {canAdd && (
                        <ChipAdder
                            aria-label='Add a hero'
                            placeholder={heroes.length ? '+ Opponent hero' : '+ Add hero'}
                            options={addOptions}
                            onAdd={(base) => onChange([...heroes, { base }])}
                        />
                    )}
                    {exclude && canExclude && (
                        <ChipAdder
                            excluding
                            aria-label='Exclude a hero'
                            placeholder='− Exclude hero'
                            options={addOptions}
                            onAdd={(base) => exclude.onChange([...excluded, { base }])}
                        />
                    )}
                    {onClear && canClear && <ChipClear what='heroes' onClear={onClear} />}
                </div>
            )}
            {hasChips && (
                <ul className='filter-chips__list'>
                    {heroes.map((pick, index) => {
                        const option = options?.heroes.find((h) => h.base === pick.base);
                        const variant =
                            option?.variants.find((v) => v.hero === pick.hero) ??
                            option?.variants[0];
                        const portrait = heroImage(
                            variant?.hero ?? pick.hero ?? pick.base,
                            variant?.portrait,
                        );
                        const variantOptions = [
                            {
                                value: '',
                                label: `Any variant${option ? ` (${formatNumber(option.count)})` : ''}`,
                            },
                            // a variant from the URL that the other filters left out
                            ...(pick.hero && !option?.variants.some((v) => v.hero === pick.hero)
                                ? [{ value: pick.hero, label: `${formatHero(pick.hero)} (0)` }]
                                : []),
                            ...(option?.variants ?? []).map((v) => ({
                                value: v.hero,
                                label: `${v.hero === pick.base ? 'Classic' : formatHero(v.hero)} (${formatNumber(v.count)})`,
                            })),
                        ];
                        return (
                            <Fragment key={pick.base}>
                                {index > 0 && (
                                    <li className='hero-chips__vs' aria-hidden='true'>
                                        vs
                                    </li>
                                )}
                                <FilterChip
                                    name={formatHero(pick.base)}
                                    image={{ src: portrait, kind: 'hero' }}
                                    onRemove={() =>
                                        onChange(heroes.filter((h) => h.base !== pick.base))
                                    }
                                >
                                    <Dropdown
                                        className='filter-chip__variant'
                                        aria-label={`${formatHero(pick.base)} variant`}
                                        variant='pill'
                                        options={variantOptions}
                                        value={pick.hero ?? ''}
                                        onSelect={(hero) => setVariant(pick.base, hero)}
                                    />
                                </FilterChip>
                            </Fragment>
                        );
                    })}
                    {exclude &&
                        excluded.map((pick) => {
                            const hero = pick.hero ?? pick.base;
                            return (
                                <FilterChip
                                    key={`not-${pick.base}`}
                                    name={formatHero(hero)}
                                    image={{
                                        src: heroImage(hero, portraits.get(hero)),
                                        kind: 'hero',
                                    }}
                                    excluded
                                    onRemove={() =>
                                        exclude.onChange(
                                            excluded.filter((h) => h.base !== pick.base),
                                        )
                                    }
                                />
                            );
                        })}
                </ul>
            )}
        </div>
    );
}
