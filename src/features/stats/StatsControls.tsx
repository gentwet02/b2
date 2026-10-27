import ControlCheckbox from '@/components/controls/ControlCheckbox';
import ControlGroup from '@/components/controls/ControlGroup';
import Controls from '@/components/controls/Controls';
import MapChip from '@/components/filter-chips/MapChip';
import Panel from '@/components/panel/Panel';
import SeasonNote from '@/components/season-note/SeasonNote';
import SeasonSelect from '@/components/season-select/SeasonSelect';
import SplitVariants from '@/components/split-variants/SplitVariants';
import { MAX_EXCLUDED } from '@/config/filters';
import useSeasons from '@/hooks/queries/useSeasons';
import type { MapChipOption } from '@/types/map';
import type { SeasonQuery } from '@/types/season';
import type { SideMode, Stats, StatsSearch } from '@/types/stats';
import { joinList, splitList } from '@/utils/search';
import { urlSeason } from '@/utils/season';
import LoadoutFilters from './LoadoutFilters';
import StatsSides, { type SideState } from './StatsSides';

interface StatsControlsProps {
    search: StatsSearch;
    /** the seasons counted, a range too ("40-47") */
    seasonQuery: SeasonQuery | undefined;
    a: SideState;
    b: SideState;
    /** names of the players picked (they may not be in the pickers' lists) */
    names: Record<string, string>;
    towers: string[];
    /** the players tabs: no map, hero and towers focus there */
    focus: boolean;
    /** the current answer: its filter options and labels */
    data: Stats | undefined;
    onChange: (next: Partial<StatsSearch>) => void;
    onModeA: (mode: SideMode) => void;
    onModeB: (mode: SideMode) => void;
    onSwap: () => void;
}

/** The season and split options, who is counted against whom, and the focus: map, hero, towers. */
export default function StatsControls(props: StatsControlsProps) {
    const {
        search,
        seasonQuery,
        a,
        b,
        names,
        towers,
        focus,
        data,
        onChange,
        onModeA,
        onModeB,
        onSwap,
    } = props;

    const seasons = useSeasons();
    const liveSeason = seasons.data?.liveSeason;
    const from = search.season === 'all' ? undefined : (search.season ?? liveSeason);

    const options = data?.options;
    const mapOptions: MapChipOption[] = (options?.maps ?? []).map((m) => ({
        ...m,
        map: data?.labels.maps[m.key]?.map ?? m.key,
        image: data?.labels.maps[m.key]?.image,
    }));
    const exMaps = splitList(search.exMaps);
    const maxExcluded = data?.maxExcluded ?? MAX_EXCLUDED;
    const split = !!search.sides;
    const hasFocus =
        !!search.map ||
        !!search.hero ||
        towers.length > 0 ||
        !!search.exHeroes ||
        !!search.exTowers ||
        !!search.exMaps ||
        !!search.hero2 ||
        !!search.towers2 ||
        !!search.exHeroes2 ||
        !!search.exTowers2;
    const loadoutFilters = (side: '' | '2') => (
        <LoadoutFilters
            side={side}
            search={search}
            options={side === '2' ? (data?.options2 ?? undefined) : options}
            maxExcluded={maxExcluded}
            onChange={onChange}
        />
    );

    return (
        <Panel className='stats-controls'>
            <Controls>
                <ControlGroup label='Season'>
                    {(search.season ?? liveSeason) !== undefined && (
                        <SeasonSelect
                            className='controls__season'
                            variant='compact'
                            allowAll
                            seasons={seasons.data?.seasons ?? []}
                            liveSeason={liveSeason}
                            value={search.season}
                            onChange={(season) =>
                                onChange({ season: urlSeason(season, liveSeason) })
                            }
                        />
                    )}
                </ControlGroup>
                {/* a range of seasons: the other end (the same season: just that one) */}
                {search.season !== 'all' && from !== undefined && (
                    <ControlGroup label='To'>
                        <SeasonSelect
                            className='controls__season'
                            variant='compact'
                            seasons={seasons.data?.seasons ?? []}
                            liveSeason={liveSeason}
                            value={search.seasonTo ?? from}
                            onChange={(to) => onChange({ seasonTo: to === from ? undefined : to })}
                        />
                    </ControlGroup>
                )}
            </Controls>

            <SeasonNote season={search.season} />

            <div className='stats-controls__sides'>
                <StatsSides
                    season={search.season}
                    seasonQuery={seasonQuery}
                    a={a}
                    b={b}
                    names={names}
                    onChange={onChange}
                    onModeA={onModeA}
                    onModeB={onModeB}
                    onSwap={onSwap}
                    filtersA={focus && split ? loadoutFilters('') : null}
                    filtersB={focus && split ? loadoutFilters('2') : null}
                />
            </div>

            {/* the focus (picks tabs) and the options: under one line, like the match filters */}
            <div className='stats-controls__focus'>
                {/* one loadout filter for the players counted, unless each side has its own */}
                {focus && !split && (
                    <Controls className='stats-controls__loadout'>{loadoutFilters('')}</Controls>
                )}
                <div className='stats-controls__map-row'>
                    {focus && (
                        <ControlGroup label='Map'>
                            <MapChip
                                value={search.map}
                                options={mapOptions}
                                onChange={(map) => onChange({ map })}
                                exclude={{
                                    items: exMaps,
                                    max: maxExcluded.maps,
                                    onChange: (next) => onChange({ exMaps: joinList(next) }),
                                }}
                                onClear={() => onChange({ map: undefined, exMaps: undefined })}
                            />
                        </ControlGroup>
                    )}
                    <div className='stats-controls__toggles'>
                        {focus && (
                            <ControlCheckbox
                                checked={split}
                                onChange={(checked) =>
                                    onChange(
                                        checked
                                            ? { sides: true }
                                            : {
                                                  sides: undefined,
                                                  hero2: undefined,
                                                  towers2: undefined,
                                                  exHeroes2: undefined,
                                                  exTowers2: undefined,
                                              },
                                    )
                                }
                            >
                                Filter sides separately
                            </ControlCheckbox>
                        )}
                        <SplitVariants />
                        {a.mode === 'top' && b.mode === 'top' && (
                            <ControlCheckbox
                                checked={search.overlap !== false}
                                onChange={(checked) =>
                                    onChange({ overlap: checked ? undefined : false })
                                }
                            >
                                Count shared players on both sides
                            </ControlCheckbox>
                        )}
                        {focus && hasFocus && (
                            <button
                                type='button'
                                className='text-link'
                                onClick={() =>
                                    onChange({
                                        map: undefined,
                                        hero: undefined,
                                        towers: undefined,
                                        exHeroes: undefined,
                                        exTowers: undefined,
                                        exMaps: undefined,
                                        hero2: undefined,
                                        towers2: undefined,
                                        exHeroes2: undefined,
                                        exTowers2: undefined,
                                    })
                                }
                            >
                                Clear map, heroes and towers
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Panel>
    );
}
