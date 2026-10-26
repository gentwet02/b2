import { useMemo } from 'react';
import ControlGroup from '@/components/controls/ControlGroup';
import Controls from '@/components/controls/Controls';
import RangeControl from '@/components/controls/RangeControl';
import Dropdown from '@/components/dropdown/Dropdown';
import SeasonSelect from '@/components/season-select/SeasonSelect';
import SegmentedControl from '@/components/segmented-control/SegmentedControl';
import SplitVariants from '@/components/split-variants/SplitVariants';
import { COMPARE_MODES } from '@/config/compare';
import useOpponentsMet from '@/hooks/queries/useOpponentsMet';
import useSeasons from '@/hooks/queries/useSeasons';
import type { CompareSearch } from '@/types/compare';
import type { SeasonScope } from '@/types/season';
import { formatNumber, plural } from '@/utils/format';
import { nameWithAlias } from '@/utils/player';
import { formatRecord, gamesOf } from '@/utils/record';
import { urlSeason } from '@/utils/season';

interface VersusControlsProps {
    userId: string;
    playerMode: boolean;
    vs: string | undefined;
    range: string;
    exclude: string | undefined;
    season: SeasonScope | undefined;
    /** the current opponent when they aren't in the list (never met) */
    vsPlayer?: { name: string | null; alias: string | null } | undefined;
    onChange: (next: CompareSearch) => void;
    onPlayerMode: () => void;
}

export default function VersusControls(props: VersusControlsProps) {
    const { userId, playerMode, vs, range, exclude, season, vsPlayer, onChange, onPlayerMode } = props;

    const seasons = useSeasons();
    const met = useOpponentsMet(userId, season);

    const playerOptions = useMemo(() => {
        const list = (met.data ?? []).map((o) => {
            const games = gamesOf(o.record);
            return {
                value: o.userId,
                label: `${nameWithAlias(o)} · ${formatNumber(games)} ${plural(games, 'game')} · ${formatRecord(o.record)}`,
            };
        });
        if (vs && !list.some((o) => o.value === vs)) {
            const name = vsPlayer?.name ? nameWithAlias(vsPlayer) : 'Unknown player';
            list.unshift({ value: vs, label: `${name} · never met` });
        }
        return list;
    }, [met.data, vs, vsPlayer]);

    return (
        <Controls aside={<SplitVariants />}>
            <ControlGroup label='Compare against' labelId='versus-mode'>
                <SegmentedControl
                    aria-labelledby='versus-mode'
                    options={COMPARE_MODES}
                    value={playerMode ? 'player' : 'top'}
                    onChange={(mode) =>
                        mode === 'player' ? onPlayerMode() : onChange({ vs: undefined })
                    }
                />
            </ControlGroup>

            {playerMode ? (
                <ControlGroup label='Player' grow>
                    <Dropdown
                        className='controls__player'
                        variant='compact'
                        options={playerOptions}
                        value={vs ?? ''}
                        searchable
                        disabled={met.isLoading && !vs}
                        placeholder={
                            met.isLoading
                                ? 'Loading the players met…'
                                : playerOptions.length
                                  ? 'Pick a player'
                                  : 'No opponent recorded'
                        }
                        aria-label='Opponent'
                        noResultsText='No opponent with that name'
                        onSelect={(id) => onChange({ vs: id })}
                    />
                </ControlGroup>
            ) : (
                <RangeControl
                    aria-label='Players compared'
                    range={range}
                    exclude={exclude}
                    onRange={(next) => onChange({ range: next })}
                    onExclude={(next) => onChange({ exclude: next })}
                />
            )}

            <ControlGroup label='Season'>
                {(season ?? seasons.data?.liveSeason) !== undefined && (
                    <SeasonSelect
                        className='controls__season'
                        variant='compact'
                        allowAll
                        seasons={seasons.data?.seasons ?? []}
                        liveSeason={seasons.data?.liveSeason}
                        value={season}
                        onChange={(next) =>
                            onChange({ season: urlSeason(next, seasons.data?.liveSeason) })
                        }
                    />
                )}
            </ControlGroup>
        </Controls>
    );
}
