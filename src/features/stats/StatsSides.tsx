import { useMemo, type ReactNode } from 'react';
import ControlGroup from '@/components/controls/ControlGroup';
import Controls from '@/components/controls/Controls';
import RangeControl from '@/components/controls/RangeControl';
import Dropdown from '@/components/dropdown/Dropdown';
import { SwapIcon } from '@/components/icons';
import SegmentedControl from '@/components/segmented-control/SegmentedControl';
import { STATS_MODES } from '@/config/stats';
import useOpponentsMet from '@/hooks/queries/useOpponentsMet';
import useRankedPlayers from '@/hooks/queries/useRankedPlayers';
import useSeasons from '@/hooks/queries/useSeasons';
import type { SeasonQuery, SeasonScope } from '@/types/season';
import type { SideMode, StatsSearch } from '@/types/stats';
import { formatNumber, plural } from '@/utils/format';
import { nameWithAlias, rankedLabel } from '@/utils/player';
import { formatRecord, gamesOf } from '@/utils/record';

/** What a side shows, defaults filled in. */
export interface SideState {
    mode: SideMode;
    player: string | undefined;
    range: string;
    exclude: string | undefined;
}

interface StatsSidesProps {
    /** the season picked (whose leaderboard the player pickers list) */
    season: SeasonScope | undefined;
    /** the seasons counted (a range too), for the players met */
    seasonQuery: SeasonQuery | undefined;
    a: SideState;
    b: SideState;
    /** names of the players picked, from the current answer (they may not be in the lists) */
    names: Record<string, string>;
    onChange: (next: Partial<StatsSearch>) => void;
    onModeA: (mode: SideMode) => void;
    onModeB: (mode: SideMode) => void;
    onSwap: () => void;
    /** each side's own loadout filters (sides filtered separately) */
    filtersA?: ReactNode;
    filtersB?: ReactNode;
}

interface Option {
    value: string;
    label: string;
}

/**
 * The two sides, like the matches page's "filter sides separately": the players counted
 * and who they played, each a range of each leaderboard or one player.
 */
export default function StatsSides(props: StatsSidesProps) {
    const { season, seasonQuery, a, b, names, onChange, onModeA, onModeB, onSwap, filtersA, filtersB } =
        props;

    const seasons = useSeasons();
    const liveSeason = seasons.data?.liveSeason;
    // one player: pick among the season's leaderboard (the live one for "all seasons")
    const boardSeason = typeof season === 'number' ? season : liveSeason;
    const pickFromBoard = b.mode === 'player' && !a.player;
    const ranked = useRankedPlayers(
        a.mode === 'player' || pickFromBoard ? boardSeason : undefined,
        boardSeason === liveSeason,
    );
    // against one player, with one player: the players they met, with the record
    const met = useOpponentsMet(b.mode === 'player' && a.player ? a.player : '', seasonQuery);

    const optionsA = useMemo(() => {
        const list: Option[] = ranked.players
            .filter((p) => p.id !== b.player)
            .map((p) => ({ value: p.id, label: rankedLabel(p) }));
        if (a.player && !list.some((o) => o.value === a.player)) {
            list.unshift({ value: a.player, label: names[a.player] ?? 'Selected player' });
        }
        return list;
    }, [ranked.players, a.player, b.player, names]);

    const optionsB = useMemo(() => {
        const list: Option[] = a.player
            ? (met.data ?? []).map((o) => {
                  const games = gamesOf(o.record);
                  return {
                      value: o.userId,
                      label: `${nameWithAlias(o)} · ${formatNumber(games)} ${plural(games, 'game')} · ${formatRecord(o.record)}`,
                  };
              })
            : ranked.players
                  .filter((p) => p.id !== a.player)
                  .map((p) => ({ value: p.id, label: rankedLabel(p) }));
        if (b.player && !list.some((o) => o.value === b.player)) {
            const name = names[b.player] ?? 'Selected player';
            list.unshift({ value: b.player, label: a.player ? `${name} · never met` : name });
        }
        return list;
    }, [met.data, ranked.players, a.player, b.player, names]);

    const pickerB = a.player
        ? {
              loading: met.isLoading,
              placeholder: met.isLoading
                  ? 'Loading the players met…'
                  : optionsB.length
                    ? 'Pick a player'
                    : 'No opponent recorded',
              noResults: 'No opponent with that name',
          }
        : {
              loading: ranked.isLoading,
              placeholder: ranked.isLoading ? 'Loading the leaderboard…' : 'Pick a player',
              noResults: 'No player with that name',
          };

    return (
        <div className='stats-sides'>
            <div className='stats-sides__side' role='group' aria-labelledby='stats-side-a'>
                <span id='stats-side-a' className='stats-sides__title'>
                    Players
                </span>
                <SegmentedControl
                    aria-labelledby='stats-side-a'
                    options={STATS_MODES}
                    value={a.mode}
                    onChange={onModeA}
                />
                <Controls>
                    {a.mode === 'player' ? (
                        <ControlGroup label='Player' grow>
                            <Dropdown
                                className='controls__player'
                                variant='compact'
                                options={optionsA}
                                value={a.player ?? ''}
                                searchable
                                disabled={ranked.isLoading && !a.player}
                                placeholder={
                                    ranked.isLoading ? 'Loading the leaderboard…' : 'Pick a player'
                                }
                                aria-label='Player'
                                noResultsText='No player with that name'
                                onSelect={(id) => onChange({ player: id })}
                            />
                        </ControlGroup>
                    ) : (
                        <RangeControl
                            aria-label='Players counted'
                            range={a.range}
                            exclude={a.exclude}
                            onRange={(next) => onChange({ players: next })}
                            onExclude={(next) => onChange({ exclude: next })}
                        />
                    )}
                </Controls>
                {filtersA != null && <div className='stats-sides__filters'>{filtersA}</div>}
            </div>

            <div className='stats-sides__vs'>
                <span aria-hidden='true'>vs</span>
                <button
                    type='button'
                    className='stats-sides__swap'
                    onClick={onSwap}
                    title='Swap the two sides'
                    aria-label='Swap the two sides'
                >
                    <SwapIcon width={18} height={18} aria-hidden='true' />
                </button>
            </div>

            <div className='stats-sides__side' role='group' aria-labelledby='stats-side-b'>
                <span id='stats-side-b' className='stats-sides__title'>
                    Against
                </span>
                <SegmentedControl
                    aria-labelledby='stats-side-b'
                    options={STATS_MODES}
                    value={b.mode}
                    onChange={onModeB}
                />
                <Controls>
                    {b.mode === 'player' ? (
                        <ControlGroup label='Opponent' grow>
                            <Dropdown
                                className='controls__player'
                                variant='compact'
                                options={optionsB}
                                value={b.player ?? ''}
                                searchable
                                disabled={pickerB.loading && !b.player}
                                placeholder={pickerB.placeholder}
                                aria-label='Opponent'
                                noResultsText={pickerB.noResults}
                                onSelect={(id) => onChange({ player2: id })}
                            />
                        </ControlGroup>
                    ) : (
                        <RangeControl
                            aria-label='Opponents counted'
                            range={b.range}
                            exclude={b.exclude}
                            onRange={(next) => onChange({ players2: next })}
                            onExclude={(next) => onChange({ exclude2: next })}
                        />
                    )}
                </Controls>
                {filtersB != null && <div className='stats-sides__filters'>{filtersB}</div>}
            </div>
        </div>
    );
}
