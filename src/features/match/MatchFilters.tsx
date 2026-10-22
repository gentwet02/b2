import type { NavigateOptions } from '@tanstack/react-router';
import Dropdown from '@/components/dropdown/Dropdown';
import { SIDE_MAX_HEROES, SIDE_MAX_TOWERS } from '@/config/match';
import type { SeasonSummary } from '@/types/info';
import {
    type MatchFilterOptions,
    type MatchesQuery,
    type MatchSort,
    SORT_LABELS,
} from '@/types/match';
import type { HeroPick } from '@/types/tower';
import { formatHeroPick, joinList, parseHero, seasonLabel, splitList } from '@/utils/format';
import HeroChips from './HeorChips';
import MapChip from './MapChip';
import PlayerSearch from './PlayerSearch';
import SideFilters from './SideFilters';
import TowerChips from './TowerChips';

const SORT_OPTIONS = (Object.keys(SORT_LABELS) as MatchSort[]).map((value) => ({
    value,
    label: SORT_LABELS[value],
}));

interface MatchFiltersProps {
    query: MatchesQuery;
    onChange: (
        patch: Partial<MatchesQuery>,
        options?: Pick<NavigateOptions, 'viewTransition'>,
    ) => void;
    options?: MatchFilterOptions | undefined;
    seasons: SeasonSummary[];
    liveSeason?: number | undefined;
    seasonId?: number | undefined;
    playerText: string;
    onPlayerText: (value: string) => void;
    player2Text: string;
    onPlayer2Text: (value: string) => void;
}

export default function MatchFilters(props: MatchFiltersProps) {
    const {
        query,
        onChange,
        options,
        seasons,
        liveSeason,
        seasonId,
        playerText,
        onPlayerText,
        player2Text,
        onPlayer2Text,
    } = props;

    const split = !!query.sameSide;
    const heroes = splitList(query.heroes).map(parseHero);
    const towers = splitList(query.towers);
    const heroes2 = splitList(query.heroes2).map(parseHero);
    const towers2 = splitList(query.towers2);
    const maxHeroes = options?.maxHeroes ?? 2;
    const maxTowers = options?.maxTowers ?? 6;

    const heroList = (next: HeroPick[]) => joinList(next.map(formatHeroPick));

    // turning "same player" on: the first hero and 3 towers go to side 1, the rest to side 2
    const splitSides = () =>
        onChange(
            {
                sameSide: true,
                heroes: heroList(heroes.slice(0, SIDE_MAX_HEROES)),
                heroes2: heroList(heroes.slice(SIDE_MAX_HEROES, 2 * SIDE_MAX_HEROES)),
                towers: joinList(towers.slice(0, SIDE_MAX_TOWERS)),
                towers2: joinList(towers.slice(SIDE_MAX_TOWERS, 2 * SIDE_MAX_TOWERS)),
                player2: undefined,
            },
            { viewTransition: { types: ['sides'] } },
        );

    // turning it off: both sides go back into the shared filters
    const mergeSides = () => {
        const name = playerText.trim() || player2Text.trim();
        onChange(
            {
                sameSide: undefined,
                player: name || undefined,
                heroes: heroList(
                    [
                        ...heroes,
                        ...heroes2.filter((h) => !heroes.some((p) => p.base === h.base)),
                    ].slice(0, maxHeroes),
                ),
                towers: joinList([...new Set([...towers, ...towers2])].slice(0, maxTowers)),
                player2: undefined,
                heroes2: undefined,
                towers2: undefined,
            },
            { viewTransition: { types: ['sides'] } },
        );
    };

    const seasonOptions = seasons.map((s) => ({
        value: s.id,
        label: `${seasonLabel(s.id)}${s.live ? ' (live)' : ''}`,
    }));

    return (
        <section className='match-filters' aria-label='Filters'>
            <div className='match-filters__row'>
                {!split && (
                    <PlayerSearch
                        value={playerText}
                        onChange={onPlayerText}
                        label='Player name, alias or id'
                        placeholder='Player name, alias or id'
                    />
                )}
                <div className='match-filters__field'>
                    <label htmlFor='match-filters-sort' className='match-filters__label'>
                        Sort
                    </label>
                    <Dropdown
                        id='match-filters-sort'
                        options={SORT_OPTIONS}
                        value={query.sort ?? 'newest'}
                        onSelect={(sort) =>
                            onChange({ sort: sort === 'newest' ? undefined : sort })
                        }
                    />
                </div>
                {seasons.length > 1 && (
                    <div className='match-filters__field'>
                        <label htmlFor='match-filters-season' className='match-filters__label'>
                            Season
                        </label>
                        <Dropdown
                            id='match-filters-season'
                            options={seasonOptions}
                            value={seasonId ?? ''}
                            placeholder='Season'
                            onSelect={(id) =>
                                onChange({
                                    season: id === liveSeason ? undefined : id,
                                    heroes: undefined,
                                    towers: undefined,
                                    heroes2: undefined,
                                    towers2: undefined,
                                    map: undefined,
                                })
                            }
                        />
                    </div>
                )}
            </div>

            {split ? (
                <div className='match-filters__sides'>
                    <SideFilters
                        title='Player 1'
                        playerText={playerText}
                        onPlayerText={onPlayerText}
                        heroes={heroes}
                        towers={towers}
                        options={options?.sides?.[0] ?? options}
                        onHeroes={(next) => onChange({ heroes: heroList(next) })}
                        onTowers={(next) => onChange({ towers: joinList(next) })}
                    />
                    <span className='match-filters__sides-vs' aria-hidden='true'>
                        vs
                    </span>
                    <SideFilters
                        title='Player 2'
                        playerText={player2Text}
                        onPlayerText={onPlayer2Text}
                        heroes={heroes2}
                        towers={towers2}
                        options={options?.sides?.[1] ?? options}
                        onHeroes={(next) => onChange({ heroes2: heroList(next) })}
                        onTowers={(next) => onChange({ towers2: joinList(next) })}
                    />
                </div>
            ) : (
                <>
                    <div className='match-filters__group'>
                        <span className='match-filters__label'>Heroes</span>
                        <HeroChips
                            heroes={heroes}
                            max={maxHeroes}
                            options={options}
                            onChange={(next) => onChange({ heroes: heroList(next) })}
                        />
                    </div>
                    <div className='match-filters__group'>
                        <span className='match-filters__label'>Towers</span>
                        <TowerChips
                            towers={towers}
                            max={maxTowers}
                            options={options}
                            onChange={(next) => onChange({ towers: joinList(next) })}
                        />
                    </div>
                </>
            )}

            <div className='match-filters__row'>
                <div className='match-filters__field match-filters__field--map'>
                    <span className='match-filters__label'>Map</span>
                    <MapChip
                        value={query.map}
                        options={options?.maps ?? []}
                        placeholder='+ Any map'
                        onChange={(map) => onChange({ map })}
                    />
                </div>
                <label className='match-filters__toggle'>
                    <input
                        type='checkbox'
                        checked={split}
                        onChange={(e) => (e.target.checked ? splitSides() : mergeSides())}
                    />
                    <span>Filter sides separately</span>
                </label>
            </div>
        </section>
    );
}
