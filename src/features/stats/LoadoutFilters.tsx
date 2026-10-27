import ControlGroup from '@/components/controls/ControlGroup';
import HeroChips from '@/components/filter-chips/HeroChips';
import TowerChips from '@/components/filter-chips/TowerChips';
import { STATS_MAX_TOWERS } from '@/config/stats';
import type { SideFilterOptions } from '@/types/match';
import type { StatsSearch } from '@/types/stats';
import { formatHeroPick, parseHero } from '@/utils/hero';
import { joinList, splitList } from '@/utils/search';

interface LoadoutFiltersProps {
    /** '' for the players counted, '2' for their opponents */
    side: '' | '2';
    search: StatsSearch;
    options?: SideFilterOptions | undefined;
    maxExcluded: { heroes: number; towers: number };
    onChange: (next: Partial<StatsSearch>) => void;
}

/** One side's loadout: a hero (any variant or one), up to 3 towers, and what's left out. */
export default function LoadoutFilters(props: LoadoutFiltersProps) {
    const { side, search, options, maxExcluded, onChange } = props;

    const key = {
        hero: `hero${side}`,
        towers: `towers${side}`,
        exHeroes: `exHeroes${side}`,
        exTowers: `exTowers${side}`,
    } as const;
    const hero = search[key.hero];
    const heroPick = hero ? parseHero(hero) : undefined;
    const towers = splitList(search[key.towers]).slice(0, STATS_MAX_TOWERS);
    const exHeroes = splitList(search[key.exHeroes]).map(parseHero);
    const exTowers = splitList(search[key.exTowers]);

    return (
        <>
            <ControlGroup label='Hero'>
                <HeroChips
                    heroes={heroPick ? [heroPick] : []}
                    max={1}
                    options={options}
                    onChange={(next) =>
                        onChange({ [key.hero]: next[0] ? formatHeroPick(next[0]) : undefined })
                    }
                    exclude={{
                        items: exHeroes,
                        max: maxExcluded.heroes,
                        onChange: (next) =>
                            onChange({ [key.exHeroes]: joinList(next.map(formatHeroPick)) }),
                    }}
                    onClear={() => onChange({ [key.hero]: undefined, [key.exHeroes]: undefined })}
                />
            </ControlGroup>
            <ControlGroup label='Towers' grow>
                <TowerChips
                    towers={towers}
                    max={STATS_MAX_TOWERS}
                    options={options}
                    onChange={(next) => onChange({ [key.towers]: joinList(next) })}
                    exclude={{
                        items: exTowers,
                        max: maxExcluded.towers,
                        onChange: (next) => onChange({ [key.exTowers]: joinList(next) }),
                    }}
                    onClear={() => onChange({ [key.towers]: undefined, [key.exTowers]: undefined })}
                />
            </ControlGroup>
        </>
    );
}
