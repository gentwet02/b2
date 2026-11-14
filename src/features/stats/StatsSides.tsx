import { useMemo, useState, type ReactNode } from 'react';
import ControlGroup from '@/components/controls/ControlGroup';
import Controls from '@/components/controls/Controls';
import Dropdown from '@/components/dropdown/Dropdown';
import { SwapIcon } from '@/components/icons';
import SegmentedControl from '@/components/segmented-control/SegmentedControl';
import { STATS_LIST_MAX, STATS_LIST_RANGE_DEFAULT, STATS_MODES } from '@/config/stats';
import useSeasonsPlayers from '@/hooks/queries/useSeasonsPlayers';
import useSideOpponents from '@/hooks/queries/useSideOpponents';
import useOldNamesSearch from '@/hooks/useOldNamesSearch';
import type { CompareSideKey } from '@/types/compare';
import type { SeasonQuery } from '@/types/season';
import type { SideDraft, SideMode, SideState, StatsSearch } from '@/types/stats';
import { formatNumber, plural } from '@/utils/format';
import { nameWithAlias, playerKeywords, rankedLabel } from '@/utils/player';
import { formatRecord, gamesOf } from '@/utils/record';
import { joinList } from '@/utils/search';
import { clanTag, isEveryone, listedIds, playerTag, rangeTag } from '@/utils/sideList';
import { sideOwnTag } from '@/utils/statsSearch';
import ClanPicker from './ClanPicker';
import SideAdd from './SideAdd';
import SideRange from './SideRange';
import SideTags from './SideTags';

interface StatsSidesProps {
    /** the seasons counted (a range too): the player pickers list their leaderboards */
    seasonQuery: SeasonQuery | undefined;
    a: SideState;
    b: SideState;
    /** names of the players and clans picked, by id (they may not be in the lists) */
    names: Record<string, string>;
    onChange: (next: Partial<StatsSearch>) => void;
    onModeA: (mode: SideMode) => void;
    onModeB: (mode: SideMode) => void;
    onSwap: () => void;
    /** "+": the side's player, clan or range starts a list, its picker free for another */
    onAdd: (side: CompareSideKey) => void;
    /** "×": everyone but the side's player, clan or range, as a list */
    onLeaveOut: (side: CompareSideKey) => void;
    /** each side's own loadout filters (sides filtered separately) */
    filtersA?: ReactNode;
    filtersB?: ReactNode;
}

interface Option {
    value: string;
    label: string;
}

const FULL_NOTE = `A list holds ${STATS_LIST_MAX} players, clans and ranges at most.`;
const NO_DRAFT: SideDraft = { range: STATS_LIST_RANGE_DEFAULT, exclude: undefined };

/**
 * The two sides, like the matches page's "filter sides separately": the players counted
 * and who they played, each a range of each leaderboard, one player or a clan; or, with "+",
 * a list of several of those counted together, and with "×" the ones left out of it. Once a
 * side is a list, its picker only holds the next one until "+" or "×".
 */
export default function StatsSides(props: StatsSidesProps) {
    const {
        seasonQuery,
        a,
        b,
        names,
        onChange,
        onModeA,
        onModeB,
        onSwap,
        onAdd,
        onLeaveOut,
        filtersA,
        filtersB,
    } = props;

    // side 1 picked (a player or a clan): side 2 only offers who it met
    const picked = useMemo(
        () => (a.player ? { player: a.player } : a.clan ? { clan: a.clan } : null),
        [a.player, a.clan],
    );
    const pickFromBoard = b.picker === 'player' && !picked;
    // one player: pick among the leaderboards of every season counted
    const ranked = useSeasonsPlayers(seasonQuery, a.picker === 'player' || pickFromBoard);
    // the players and clans side 1 met, with the record
    const met = useSideOpponents(b.picker === 'top' ? null : picked, seasonQuery);

    const oldNames = useOldNamesSearch();

    // a list: its pickers hold the next one, and don't offer who is already in it or left out
    const listedA = a.mode === 'list';
    const listedB = b.mode === 'list';
    const [drafts, setDrafts] = useState<Record<CompareSideKey, SideDraft>>({
        a: NO_DRAFT,
        b: NO_DRAFT,
    });
    const inA = useMemo(() => listedIds([...a.list, ...a.not], 'player'), [a.list, a.not]);
    const inB = useMemo(() => listedIds([...b.list, ...b.not], 'player'), [b.list, b.not]);

    function setDraft(key: CompareSideKey, next: Partial<SideDraft>) {
        setDrafts((d) => ({ ...d, [key]: { ...d[key], ...next } }));
    }

    /** A side's list and the ones left out, set together (a tag is in one of them only). */
    function setTags(key: CompareSideKey, tags: string[], leftOut: string[]) {
        const list = joinList(tags);
        const not = joinList(leftOut);
        onChange(key === 'a' ? { list, not } : { list2: list, not2: not });
    }

    /** What a list's picker holds goes in the list, or with the ones left out. */
    function place(key: CompareSideKey, tag: string, leftOut: boolean) {
        const side = key === 'a' ? a : b;
        const list = side.list.filter((t) => t !== tag);
        const not = side.not.filter((t) => t !== tag);
        (leftOut ? not : list).push(tag);
        setTags(key, list, not);
        setDraft(key, { player: undefined, clan: undefined });
    }

    function remove(key: CompareSideKey, tag: string) {
        const side = key === 'a' ? a : b;
        setTags(
            key,
            side.list.filter((t) => t !== tag),
            side.not.filter((t) => t !== tag),
        );
    }

    /** What a side's picker holds, as a tag: the side itself, or a list's next one. */
    function heldTag(side: SideState, draft: SideDraft) {
        if (side.mode !== 'list') return sideOwnTag(side);
        if (side.picker === 'player') return draft.player && playerTag(draft.player);
        if (side.picker === 'clan') return draft.clan && clanTag(draft.clan);
        return rangeTag(draft.range, draft.exclude);
    }

    /** "+" and "×" after a side's picker, for what it holds. */
    function buttons(key: CompareSideKey) {
        const side = key === 'a' ? a : b;
        const tag = heldTag(side, drafts[key]);
        if (!tag) return null;
        const listed = side.mode === 'list';
        const canAdd = side.list.length < STATS_LIST_MAX && !side.list.includes(tag);
        const canLeaveOut =
            side.not.length < STATS_LIST_MAX && !side.not.includes(tag) && !isEveryone(tag);
        return (
            <>
                {canAdd && (
                    <SideAdd
                        label={listed ? 'Add to the list' : 'Add another player, clan or range'}
                        onClick={() => (listed ? place(key, tag, false) : onAdd(key))}
                    />
                )}
                {canLeaveOut && (
                    <SideAdd
                        excluding
                        label={listed ? 'Leave out of the list' : 'Everyone but this one'}
                        onClick={() => (listed ? place(key, tag, true) : onLeaveOut(key))}
                    />
                )}
            </>
        );
    }
    const fullA = a.list.length >= STATS_LIST_MAX && a.not.length >= STATS_LIST_MAX;
    const fullB = b.list.length >= STATS_LIST_MAX && b.not.length >= STATS_LIST_MAX;

    const optionsA = useMemo(() => {
        const list: Option[] = ranked.players
            .filter((p) => p.id !== b.player && !inA.has(p.id))
            .map((p) => ({
                value: p.id,
                label: rankedLabel(p),
                searchLabel: rankedLabel({ ...p, tag: null, seasonId: undefined }),
                keywords: playerKeywords(p, p.id, oldNames),
            }));
        if (a.player && !list.some((o) => o.value === a.player)) {
            list.unshift({ value: a.player, label: names[a.player] ?? 'Selected player' });
        }
        return list;
    }, [ranked.players, a.player, b.player, inA, names, oldNames]);

    const optionsB = useMemo(() => {
        const list: Option[] = picked
            ? (met.data?.opponents ?? []).flatMap((o) => {
                  if (inB.has(o.userId)) return [];
                  const games = gamesOf(o.record);
                  return {
                      value: o.userId,
                      label: `${nameWithAlias(o)} · ${formatNumber(games)} ${plural(games, 'game')} · ${formatRecord(o.record)}`,
                      searchLabel: nameWithAlias({ ...o, tag: null }),
                      keywords: playerKeywords(o, o.userId, oldNames),
                  };
              })
            : ranked.players
                  .filter((p) => p.id !== a.player && !inB.has(p.id))
                  .map((p) => ({
                      value: p.id,
                      label: rankedLabel(p),
                      searchLabel: rankedLabel({ ...p, tag: null, seasonId: undefined }),
                      keywords: playerKeywords(p, p.id, oldNames),
                  }));
        if (b.player && !list.some((o) => o.value === b.player)) {
            const name = names[b.player] ?? 'Selected player';
            list.unshift({ value: b.player, label: picked ? `${name} · never met` : name });
        }
        return list;
    }, [met.data, ranked.players, picked, a.player, b.player, inB, names, oldNames]);

    const pickerB = picked
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
              placeholder: ranked.isLoading ? 'Loading the leaderboards…' : 'Pick a player',
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
                    value={a.picker}
                    onChange={onModeA}
                />
                <Controls>
                    {fullA ? (
                        <p className='stats-sides__note'>{FULL_NOTE}</p>
                    ) : a.picker === 'player' ? (
                        <ControlGroup label='Player' grow>
                            <Dropdown
                                className='controls__player'
                                variant='compact'
                                options={optionsA}
                                value={(listedA ? drafts.a.player : a.player) ?? ''}
                                searchable
                                disabled={ranked.isLoading && !a.player}
                                placeholder={
                                    ranked.isLoading ? 'Loading the leaderboards…' : 'Pick a player'
                                }
                                aria-label='Player'
                                noResultsText='No player with that name'
                                onSelect={(id) =>
                                    listedA
                                        ? setDraft('a', { player: id })
                                        : onChange({ player: id })
                                }
                            />
                        </ControlGroup>
                    ) : a.picker === 'clan' ? (
                        <ClanPicker
                            label='Clan'
                            value={listedA ? drafts.a.clan : a.clan}
                            other={b.clan}
                            name={a.clan ? names[a.clan] : undefined}
                            onSelect={(id) =>
                                listedA ? setDraft('a', { clan: id }) : onChange({ clan: id })
                            }
                        />
                    ) : (
                        <SideRange
                            aria-label='Players counted'
                            side={a}
                            draft={drafts.a}
                            onRange={(next) => onChange({ players: next })}
                            onExclude={(next) => onChange({ exclude: next })}
                            onDraft={(next) => setDraft('a', next)}
                        />
                    )}
                    {!fullA && buttons('a')}
                </Controls>
                {filtersA != null && <div className='stats-sides__filters'>{filtersA}</div>}
                {(listedA || a.not.length > 0) && (
                    <SideTags
                        label='Players counted'
                        tags={a.list}
                        excluded={a.not}
                        names={names}
                        onRemove={(tag) => remove('a', tag)}
                        onRemoveExcluded={(tag) => remove('a', tag)}
                    />
                )}
                {a.list.length + a.not.length > 1 && (
                    <button
                        type='button'
                        className='text-link'
                        onClick={() =>
                            onChange({
                                list: undefined,
                                not: undefined,
                            })
                        }
                    >
                        Clear
                    </button>
                )}
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
                    value={b.picker}
                    onChange={onModeB}
                />
                <Controls>
                    {fullB ? (
                        <p className='stats-sides__note'>{FULL_NOTE}</p>
                    ) : b.picker === 'player' ? (
                        <ControlGroup label='Opponent' grow>
                            <Dropdown
                                className='controls__player'
                                variant='compact'
                                options={optionsB}
                                value={(listedB ? drafts.b.player : b.player) ?? ''}
                                searchable
                                disabled={pickerB.loading && !b.player}
                                placeholder={pickerB.placeholder}
                                aria-label='Opponent'
                                noResultsText={pickerB.noResults}
                                onSelect={(id) =>
                                    listedB
                                        ? setDraft('b', { player: id })
                                        : onChange({ player2: id })
                                }
                            />
                        </ControlGroup>
                    ) : b.picker === 'clan' ? (
                        <ClanPicker
                            label='Opposing clan'
                            value={listedB ? drafts.b.clan : b.clan}
                            other={a.clan}
                            name={b.clan ? names[b.clan] : undefined}
                            met={
                                picked
                                    ? { clans: met.data?.clans, loading: met.isLoading }
                                    : undefined
                            }
                            onSelect={(id) =>
                                listedB ? setDraft('b', { clan: id }) : onChange({ clan2: id })
                            }
                        />
                    ) : (
                        <SideRange
                            aria-label='Opponents counted'
                            side={b}
                            draft={drafts.b}
                            onRange={(next) => onChange({ players2: next })}
                            onExclude={(next) => onChange({ exclude2: next })}
                            onDraft={(next) => setDraft('b', next)}
                        />
                    )}
                    {!fullB && buttons('b')}
                </Controls>
                {filtersB != null && <div className='stats-sides__filters'>{filtersB}</div>}
                {(listedB || b.not.length > 0) && (
                    <SideTags
                        label='Opponents counted'
                        tags={b.list}
                        excluded={b.not}
                        names={names}
                        onRemove={(tag) => remove('b', tag)}
                        onRemoveExcluded={(tag) => remove('b', tag)}
                    />
                )}
                {b.list.length + b.not.length > 1 && (
                    <button
                        type='button'
                        className='text-link'
                        onClick={() =>
                            onChange({
                                list2: undefined,
                                not2: undefined,
                            })
                        }
                    >
                        Clear
                    </button>
                )}
            </div>
        </div>
    );
}
