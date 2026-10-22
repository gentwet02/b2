import Dropdown from '@/components/dropdown/Dropdown';
import ChipAdder from '@/components/filter-chips/ChipAdder';
import FilterChip from '@/components/filter-chips/FilterChip';
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
}

/** Heroes filtered on ("vs" between two), each with any variant or one. */
export default function HeroChips(props: HeroChipsProps) {
    const { heroes, max, options, onChange } = props;

    const addOptions = (options?.heroes ?? [])
        .filter((h) => h.count > 0 && !heroes.some((p) => p.base === h.base))
        .map((h) => ({ value: h.base, label: `${formatHero(h.base)} (${formatNumber(h.count)})` }));

    const setVariant = (base: string, hero: string) =>
        onChange(heroes.map((h) => (h.base === base ? (hero ? { base, hero } : { base }) : h)));

    return (
        <div className='filter-chips'>
            {heroes.map((pick, index) => {
                const option = options?.heroes.find((h) => h.base === pick.base);
                const variant =
                    option?.variants.find((v) => v.hero === pick.hero) ?? option?.variants[0];
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
                    <span key={pick.base} className='hero-chips__wrap'>
                        {index > 0 && <span className='hero-chips__vs'>vs</span>}
                        <FilterChip
                            name={formatHero(pick.base)}
                            image={{ src: portrait, kind: 'hero' }}
                            onRemove={() => onChange(heroes.filter((h) => h.base !== pick.base))}
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
                    </span>
                );
            })}
            {heroes.length < max && (
                <ChipAdder
                    aria-label='Add a hero'
                    placeholder={heroes.length ? '+ Opponent hero' : '+ Add hero'}
                    options={addOptions}
                    onAdd={(base) => onChange([...heroes, { base }])}
                />
            )}
        </div>
    );
}
