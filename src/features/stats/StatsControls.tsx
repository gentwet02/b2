import { useMemo } from 'react';
import ControlGroup from '@/components/controls/ControlGroup';
import Controls from '@/components/controls/Controls';
import RangeControl from '@/components/controls/RangeControl';
import Dropdown from '@/components/dropdown/Dropdown';
import HeroChips from '@/components/filter-chips/HeroChips';
import MapChip from '@/components/filter-chips/MapChip';
import TowerChips from '@/components/filter-chips/TowerChips';
import Panel from '@/components/panel/Panel';
import SeasonNote from '@/components/season-note/SeasonNote';
import SeasonSelect from '@/components/season-select/SeasonSelect';
import SegmentedControl from '@/components/segmented-control/SegmentedControl';
import { MAX_EXCLUDED } from '@/config/filters';
import { STATS_MAX_TOWERS, STATS_MODES } from '@/config/stats';
import useRankedPlayers from '@/hooks/queries/useRankedPlayers';
import useSeasons from '@/hooks/queries/useSeasons';
import type { MapChipOption } from '@/types/map';
import type { Stats, StatsSearch } from '@/types/stats';
import { formatHeroPick, parseHero } from '@/utils/hero';
import { playerLabel, rankedLabel } from '@/utils/player';
import { joinList, splitList } from '@/utils/search';
import { urlSeason } from '@/utils/season';

interface StatsControlsProps {
    search: StatsSearch;
    playerMode: boolean;
    /** the leaderboard range counted */
    players: string;
    towers: string[];
    /** the current answer: its filter options and labels */
    data: Stats | undefined;
    onChange: (next: Partial<StatsSearch>) => void;
    onPlayerMode: () => void;
}

/** Who is counted (a group or one player, a season), and the focus: map, hero, towers. */
export default function StatsControls(props: StatsControlsProps) {
    const { search, playerMode, players, towers, data, onChange, onPlayerMode } = props;

    const seasons = useSeasons();
    const liveSeason = seasons.data?.liveSeason;
    // one player: pick among the season's leaderboard (the live one for "all seasons")
    const boardSeason = typeof search.season === 'number' ? search.season : liveSeason;
    const ranked = useRankedPlayers(
        playerMode ? boardSeason : undefined,
        boardSeason === liveSeason,
    );

    const playerOptions = useMemo(() => {
        const list = ranked.players.map((p) => ({ value: p.id, label: rankedLabel(p) }));
        if (search.player && !list.some((o) => o.value === search.player)) {
            const known = data?.player?.userId === search.player ? data.player : null;
            list.unshift({
                value: search.player,
                label: known ? playerLabel(known) : 'Selected player',
            });
        }
        return list;
    }, [ranked.players, search.player, data?.player]);

    const options = data?.options;
    const heroPick = search.hero ? parseHero(search.hero) : undefined;
    const mapOptions: MapChipOption[] = (options?.maps ?? []).map((m) => ({
        ...m,
        map: data?.labels.maps[m.key]?.map ?? m.key,
        image: data?.labels.maps[m.key]?.image,
    }));
    const exHeroes = splitList(search.exHeroes).map(parseHero);
    const exTowers = splitList(search.exTowers);
    const exMaps = splitList(search.exMaps);
    const maxExcluded = data?.maxExcluded ?? MAX_EXCLUDED;
    const hasFocus =
        !!search.map ||
        !!search.hero ||
        towers.length > 0 ||
        !!search.exHeroes ||
        !!search.exTowers ||
        !!search.exMaps;

    return (
        <Panel className='stats-controls'>
            <Controls>
                <ControlGroup label='Players' labelId='stats-mode'>
                    <SegmentedControl
                        aria-labelledby='stats-mode'
                        options={STATS_MODES}
                        value={playerMode ? 'player' : 'group'}
                        onChange={(mode) =>
                            mode === 'player' ? onPlayerMode() : onChange({ player: undefined })
                        }
                    />
                </ControlGroup>

                {playerMode && (
                    <ControlGroup label='Player' grow>
                        <Dropdown
                            variant='compact'
                            options={playerOptions}
                            value={search.player ?? ''}
                            searchable
                            disabled={ranked.isLoading && !search.player}
                            placeholder={
                                ranked.isLoading ? 'Loading the leaderboard…' : 'Pick a player'
                            }
                            aria-label='Player'
                            noResultsText='No player with that name'
                            onSelect={(id) => onChange({ player: id })}
                        />
                    </ControlGroup>
                )}

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

                {!playerMode && (
                    <RangeControl
                        aria-label='Players counted'
                        range={players}
                        exclude={search.exclude}
                        onRange={(next) => onChange({ players: next })}
                        onExclude={(exclude) => onChange({ exclude })}
                    />
                )}

            </Controls>

            <SeasonNote season={search.season} />

            <Controls className='stats-controls__focus'>
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
                <ControlGroup label='Hero'>
                    <HeroChips
                        heroes={heroPick ? [heroPick] : []}
                        max={1}
                        options={options}
                        onChange={(next) =>
                            onChange({ hero: next[0] ? formatHeroPick(next[0]) : undefined })
                        }
                        exclude={{
                            items: exHeroes,
                            max: maxExcluded.heroes,
                            onChange: (next) =>
                                onChange({ exHeroes: joinList(next.map(formatHeroPick)) }),
                        }}
                        onClear={() => onChange({ hero: undefined, exHeroes: undefined })}
                    />
                </ControlGroup>
                <ControlGroup label='Towers (all of them)' grow>
                    <TowerChips
                        towers={towers}
                        max={STATS_MAX_TOWERS}
                        options={options}
                        onChange={(next) => onChange({ towers: joinList(next) })}
                        exclude={{
                            items: exTowers,
                            max: maxExcluded.towers,
                            onChange: (next) => onChange({ exTowers: joinList(next) }),
                        }}
                        onClear={() => onChange({ towers: undefined, exTowers: undefined })}
                    />
                </ControlGroup>
                {hasFocus && (
                    <button
                        type='button'
                        className='text-link stats-controls__clear'
                        onClick={() =>
                            onChange({
                                map: undefined,
                                hero: undefined,
                                towers: undefined,
                                exHeroes: undefined,
                                exTowers: undefined,
                                exMaps: undefined,
                            })
                        }
                    >
                        Clear map, hero and towers
                    </button>
                )}
            </Controls>
        </Panel>
    );
}
