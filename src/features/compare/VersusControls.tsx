import Dropdown from '@/components/dropdown/Dropdown';
import { COMPARE_RANGES, previousRange } from '@/config/compare';
import useOpponentsMet from '@/hooks/useOpponentsMet';
import useSeasons from '@/hooks/useSeasons';
import type { CompareSearch, CompareSeason, MetOpponent } from '@/types/compare';
import { formatRecord, gamesOf } from '@/utils/compare';
import { getAlias, seasonLabel } from '@/utils/format';
import { useMemo } from 'react';

interface VersusControlsProps {
    userId: string;
    playerMode: boolean;
    vs: string | undefined;
    range: string;
    band: boolean;
    season: CompareSeason | undefined;
    /** name of the current opponent when they aren't in the list (never met) */
    vsName?: string | null | undefined;
    vsAlias?: string | null | undefined;
    onChange: (next: CompareSearch) => void;
    onPlayerMode: () => void;
}

export default function VersusControls(props: VersusControlsProps) {
    const { userId, playerMode, vs, range, band, season, vsName, vsAlias, onChange, onPlayerMode } =
        props;

    const seasons = useSeasons();
    const met = useOpponentsMet(userId, season);

    const liveSeason = seasons.data?.liveSeason;
    const previous = previousRange(range);

    const seasonOptions = [
        { value: 'all', label: 'All seasons' },
        ...(seasons.data?.seasons ?? []).map((s) => ({
            value: String(s.id),
            label: `${seasonLabel(s.id)}${s.live ? ' (live)' : ''}`,
        })),
    ];
    const seasonValue = season === undefined ? String(liveSeason ?? '') : String(season);
    const setSeason = (value: string) =>
        onChange({
            season:
                value === 'all' ? 'all' : Number(value) === liveSeason ? undefined : Number(value),
        });

    const vsLabel = `${vsName}${vsAlias ? ` (${vsAlias})` : ''}`;
    const playerLabel = (o: MetOpponent) => `${o.name} ${getAlias(o) ? `(${getAlias(o)})` : ''}`;
    const playerOptions = useMemo(() => {
        const list = (met.data ?? []).map((o) => ({
            value: o.userId,
            label: `${playerLabel(o)} · ${gamesOf(o.record)} ${gamesOf(o.record) === 1 ? 'game' : 'games'} · ${formatRecord(o.record)}`,
        }));
        if (vs && !list.some((o) => o.value === vs)) {
            list.unshift({ value: vs, label: `${vsLabel ?? 'Unknown player'} · never met` });
        }
        return list;
    }, [met.data, vs, vsLabel]);

    return (
        <div className='versus-controls'>
            <div className='versus-controls__group'>
                <span className='versus-controls__label' id='versus-mode'>
                    Compare against
                </span>
                <div className='h2h-scope' role='group' aria-labelledby='versus-mode'>
                    <button
                        type='button'
                        className='h2h-scope__option'
                        aria-pressed={!playerMode}
                        onClick={() => onChange({ vs: undefined })}
                    >
                        Top players
                    </button>
                    <button
                        type='button'
                        className='h2h-scope__option'
                        aria-pressed={playerMode}
                        onClick={onPlayerMode}
                    >
                        One player
                    </button>
                </div>
            </div>

            {playerMode ? (
                <div className='versus-controls__group versus-controls__group--grow'>
                    <span className='versus-controls__label'>Player</span>
                    <Dropdown
                        className='versus-controls__player'
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
                </div>
            ) : (
                <>
                    <div className='versus-controls__group'>
                        <span className='versus-controls__label'>Range</span>
                        <Dropdown
                            className='versus-controls__range'
                            variant='compact'
                            options={COMPARE_RANGES}
                            value={range}
                            aria-label='Players compared'
                            onSelect={(next) => onChange({ range: next })}
                        />
                    </div>
                    {previous && (
                        <label className='versus-controls__band'>
                            <input
                                type='checkbox'
                                checked={band}
                                onChange={(event) => onChange({ band: event.target.checked })}
                            />
                            Leave out the {previous.label.replace('Top', 'top')}
                        </label>
                    )}
                </>
            )}

            <div className='versus-controls__group'>
                <span className='versus-controls__label'>Season</span>
                {seasonValue && (
                    <Dropdown
                        className='versus-controls__season'
                        variant='compact'
                        options={seasonOptions}
                        value={seasonValue}
                        aria-label='Season'
                        onSelect={setSeason}
                    />
                )}
            </div>
        </div>
    );
}
