import Dropdown from '@/components/dropdown/Dropdown';
import type { SideFilterOptions } from '@/types/match';
import type { HeroPick } from '@/types/tower';
import { heroImage } from '@/utils/assetOverrides';
import { formatHero, formatNumber } from '@/utils/format';

interface HeroChipsProps {
    heroes: HeroPick[];
    max: number;
    options?: SideFilterOptions | undefined;
    onChange: (next: HeroPick[]) => void;
}

export default function HeroChips(props: HeroChipsProps) {
    const { heroes, max, options, onChange } = props;

    const addOptions = (options?.heroes ?? [])
        .filter((h) => h.count > 0 && !heroes.some((p) => p.base === h.base))
        .map((h) => ({ value: h.base, label: `${formatHero(h.base)} (${formatNumber(h.count)})` }));

    return (
        <div className='match-filters__chips'>
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
                    ...(pick.hero && !option?.variants.some((v) => v.hero === pick.hero)
                        ? [{ value: pick.hero, label: `${formatHero(pick.hero)} (0)` }]
                        : []),
                    ...(option?.variants ?? []).map((v) => ({
                        value: v.hero,
                        label: `${v.hero === pick.base ? 'Classic' : formatHero(v.hero)} (${formatNumber(v.count)})`,
                    })),
                ];
                return (
                    <span key={pick.base} className='match-filters__hero-wrap'>
                        {index > 0 && <span className='match-filters__vs'>vs</span>}
                        <span className='chip-filter chip-filter--hero'>
                            {portrait && <img className='chip-filter__img' src={portrait} alt='' />}
                            <span className='chip-filter__name'>{formatHero(pick.base)}</span>
                            <Dropdown
                                className='chip-filter__variant'
                                aria-label={`${formatHero(pick.base)} variant`}
                                variant='pill'
                                options={variantOptions}
                                value={pick.hero ?? ''}
                                onSelect={(hero) =>
                                    onChange(
                                        heroes.map((h) =>
                                            h.base === pick.base
                                                ? hero
                                                    ? { base: h.base, hero }
                                                    : { base: h.base }
                                                : h,
                                        ),
                                    )
                                }
                            />
                            <button
                                type='button'
                                className='chip-filter__remove'
                                aria-label={`Remove ${formatHero(pick.base)}`}
                                onClick={() => onChange(heroes.filter((h) => h.base !== pick.base))}
                            >
                                ×
                            </button>
                        </span>
                    </span>
                );
            })}
            {heroes.length < max && (
                <Dropdown
                    className='match-filters__add'
                    aria-label='Add a hero'
                    placeholder={heroes.length ? '+ Opponent hero' : '+ Add hero'}
                    options={addOptions}
                    value=''
                    onSelect={(base) => onChange([...heroes, { base }])}
                />
            )}
        </div>
    );
}
