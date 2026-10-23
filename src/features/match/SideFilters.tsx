import HeroChips from '@/components/filter-chips/HeroChips';
import TowerChips from '@/components/filter-chips/TowerChips';
import { SIDE_MAX_HEROES, SIDE_MAX_TOWERS } from '@/config/match';
import type { HeroPick } from '@/types/hero';
import type { SideFilterOptions } from '@/types/match';
import PlayerSearch from './PlayerSearch';

interface SideFiltersProps {
    title: string;
    playerText: string;
    onPlayerText: (value: string) => void;
    heroes: HeroPick[];
    towers: string[];
    exHeroes: HeroPick[];
    exTowers: string[];
    maxExcluded: { heroes: number; towers: number };
    options?: SideFilterOptions | undefined;
    onHeroes: (next: HeroPick[]) => void;
    onTowers: (next: string[]) => void;
    onExHeroes: (next: HeroPick[]) => void;
    onExTowers: (next: string[]) => void;
    /** empty the hero / towers picks and exclusions in one change */
    onClearHeroes: () => void;
    onClearTowers: () => void;
}

/** "Filter sides separately": one player's name, hero and towers, and what they didn't use. */
export default function SideFilters(props: SideFiltersProps) {
    const {
        title,
        playerText,
        onPlayerText,
        heroes,
        onHeroes,
        towers,
        onTowers,
        exHeroes,
        onExHeroes,
        exTowers,
        onExTowers,
        maxExcluded,
        options,
        onClearHeroes,
        onClearTowers,
    } = props;

    return (
        <div className='match-filters__side' role='group' aria-label={title}>
            <span className='match-filters__side-title'>{title}</span>
            <PlayerSearch
                value={playerText}
                onChange={onPlayerText}
                label={`${title} name, alias or id`}
                placeholder='Player name, alias or id'
            />
            <div className='match-filters__side-group'>
                <span className='match-filters__label'>Hero</span>
                <HeroChips
                    heroes={heroes}
                    max={SIDE_MAX_HEROES}
                    options={options}
                    onChange={onHeroes}
                    exclude={{ items: exHeroes, max: maxExcluded.heroes, onChange: onExHeroes }}
                    onClear={onClearHeroes}
                />
            </div>
            <div className='match-filters__side-group'>
                <span className='match-filters__label'>
                    Towers
                    <span className='match-filters__cap'>up to {SIDE_MAX_TOWERS}</span>
                </span>
                <TowerChips
                    towers={towers}
                    max={SIDE_MAX_TOWERS}
                    options={options}
                    onChange={onTowers}
                    exclude={{ items: exTowers, max: maxExcluded.towers, onChange: onExTowers }}
                    onClear={onClearTowers}
                />
            </div>
        </div>
    );
}
