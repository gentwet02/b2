import PlayerAvatar from '@/components/avatar/PlayerAvatar';
import type { RankedPlayer } from '@/features/LeaderboardScore';
import usePlayerAvatar from '@/hooks/usePlayerAvatar';
import type { OpponentSlot } from '@/hooks/useOpponentSlots';
import type { H2hOpponent, H2hPick, HeadToHead, Wld } from '@/types/compare';
import {
    formatLoadout,
    formatRate,
    formatRecord,
    gamesOf,
    inScope,
    playerLabel,
    rateColor,
    rateOf,
    recordTitle,
} from '@/utils/compare';
import { formatMap, formatNumber, timeAgo } from '@/utils/format';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import OpponentSelect from './OpponentSelect';

/** Sized by its box, so the initial fallback stays a circle at any size. */
function SlotAvatar({ id, name, size = 36 }: { id: string; name: string; size?: number }) {
    const src = usePlayerAvatar(id);
    return (
        <span className='h2h-avatar' style={{ width: size, height: size, fontSize: size * 0.45 }}>
            <PlayerAvatar className='h2h-avatar__img' src={src} name={name} size={size} lazy />
        </span>
    );
}

/** Rows of every table: the opponent of each slot, in slot order (undefined while loading). */
function rowsOf(data: HeadToHead, slots: OpponentSlot[]) {
    const byId = new Map(data.opponents.map((o) => [o.userId, o]));
    return slots.map((slot) => ({ slot, o: byId.get(slot.id) }));
}

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------

interface SlotsProps {
    data: HeadToHead | undefined;
    userId: string;
    slots: OpponentSlot[];
    players: RankedPlayer[];
    onSlot: (index: number, id: string | null) => void;
}

export function H2hSlots({ data, userId, slots, players, onSlot }: SlotsProps) {
    const byId = new Map((data?.opponents ?? []).map((o) => [o.userId, o]));
    const ids = slots.map((s) => s.id);
    return (
        <ol className='h2h-slots'>
            {slots.map((slot) => {
                const o = byId.get(slot.id);
                const name =
                    (o && playerLabel(o)) ||
                    playerLabel(players.find((p) => p.id === slot.id) ?? {});
                return (
                    <li key={slot.index} className='h2h-slots__item'>
                        <span className='h2h-slots__num'>{slot.index + 1}</span>
                        <SlotAvatar id={slot.id} name={name} size={32} />
                        <OpponentSelect
                            slot={slot}
                            players={players}
                            taken={new Set([userId, ...ids.filter((id) => id !== slot.id)])}
                            fallbackName={o ? name : undefined}
                            onChange={(id) => onSlot(slot.index, id)}
                        />
                        <Link
                            to='/user/$userId'
                            params={{ userId: slot.id }}
                            className='h2h-slots__profile'
                            aria-label={`Open ${name}'s profile`}
                            title='Open profile'
                        >
                            ↗
                        </Link>
                    </li>
                );
            })}
        </ol>
    );
}

// ---------------------------------------------------------------------------
// Shared cells
// ---------------------------------------------------------------------------

function OpponentCell({ id, o }: { id: string; o: H2hOpponent | undefined }) {
    const name = o ? playerLabel(o) : '…';
    return (
        <th scope='row'>
            <span className='h2h-opponent'>
                <SlotAvatar id={id} name={name} size={28} />
                <Link
                    to='/user/$userId'
                    params={{ userId: id }}
                    className='h2h-opponent__name'
                    title={name}
                >
                    {name}
                </Link>
                {o?.rank != null && <span className='h2h-opponent__rank'>#{o.rank}</span>}
            </span>
        </th>
    );
}

function RateCell({ record }: { record: Wld | undefined }) {
    const rate = rateOf(record);
    if (rate === null) return <span className='lb-num lb-num--empty'>–</span>;
    return (
        <span className='lb-rate' title={recordTitle(record!)}>
            <span className='lb-rate__value'>{rate.toFixed(0)}%</span>
            <span className='lb-rate__bar' aria-hidden='true'>
                <span style={{ width: `${rate}%` }} />
            </span>
        </span>
    );
}

function PickCell({
    pick,
    kind,
    data,
}: {
    pick: H2hPick | null;
    kind: 'map' | 'loadout';
    data: HeadToHead;
}) {
    if (!pick) return <span className='lb-num lb-num--empty'>–</span>;
    let name: ReactNode;
    if (kind === 'map') name = formatMap(data.labels.maps[pick.key]?.map ?? pick.key);
    else {
        const { hero, towers } = formatLoadout(pick.key);
        name = (
            <>
                {hero}
                <span className='h2h-pick__towers'>{towers}</span>
            </>
        );
    }
    return (
        <span className='h2h-pick' title={recordTitle(pick.record)}>
            <span className='h2h-pick__name'>{name}</span>
            <span className='h2h-pick__stats'>
                {formatRecord(pick.record)} · {formatRate(rateOf(pick.record))}
            </span>
        </span>
    );
}

/** A loading or never-met row spans the rest of the table. */
function EmptyCells({
    o,
    span,
    data,
}: {
    o: H2hOpponent | undefined;
    span: number;
    data: HeadToHead;
}) {
    return (
        <td colSpan={span} className='h2h-table__empty'>
            {o ? `Never met ${inScope(data)}` : 'Loading…'}
        </td>
    );
}

interface TableProps {
    data: HeadToHead;
    slots: OpponentSlot[];
}

// ---------------------------------------------------------------------------
// Record
// ---------------------------------------------------------------------------

export function H2hRecordTable({ data, slots }: TableProps) {
    return (
        <div className='h2h-scroll'>
            <table className='h2h-table'>
                <thead>
                    <tr>
                        <th scope='col'>Opponent</th>
                        <th scope='col'>Games</th>
                        <th scope='col'>W–L</th>
                        <th scope='col'>Win rate</th>
                        <th scope='col'>Best map</th>
                        <th scope='col'>Worst map</th>
                        <th scope='col'>Last met</th>
                    </tr>
                </thead>
                <tbody>
                    {rowsOf(data, slots).map(({ slot, o }) => (
                        <tr key={slot.index}>
                            <OpponentCell id={slot.id} o={o} />
                            {!o || gamesOf(o.record) === 0 ? (
                                <EmptyCells o={o} span={6} data={data} />
                            ) : (
                                <>
                                    <td className='lb-num'>{formatNumber(gamesOf(o.record))}</td>
                                    <td className='lb-num' title={recordTitle(o.record)}>
                                        {formatRecord(o.record)}
                                    </td>
                                    <td>
                                        <RateCell record={o.record} />
                                    </td>
                                    <td>
                                        <PickCell pick={o.best.map} kind='map' data={data} />
                                    </td>
                                    <td>
                                        <PickCell pick={o.worst.map} kind='map' data={data} />
                                    </td>
                                    <td className='h2h-table__soft'>{timeAgo(o.lastMet) ?? '–'}</td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Loadouts
// ---------------------------------------------------------------------------

export function H2hLoadoutTable({ data, slots }: TableProps) {
    return (
        <div className='h2h-scroll'>
            <table className='h2h-table'>
                <thead>
                    <tr>
                        <th scope='col'>Opponent</th>
                        <th scope='col'>Your best</th>
                        <th scope='col'>Your worst</th>
                        <th scope='col'>Their most played</th>
                        <th scope='col'>Theirs you beat most</th>
                        <th scope='col'>Theirs that beats you</th>
                    </tr>
                </thead>
                <tbody>
                    {rowsOf(data, slots).map(({ slot, o }) => (
                        <tr key={slot.index}>
                            <OpponentCell id={slot.id} o={o} />
                            {!o || gamesOf(o.record) === 0 ? (
                                <EmptyCells o={o} span={5} data={data} />
                            ) : (
                                <>
                                    <td>
                                        <PickCell pick={o.best.mine} kind='loadout' data={data} />
                                    </td>
                                    <td>
                                        <PickCell pick={o.worst.mine} kind='loadout' data={data} />
                                    </td>
                                    <td>
                                        <PickCell pick={o.top.theirs} kind='loadout' data={data} />
                                    </td>
                                    <td>
                                        <PickCell pick={o.best.theirs} kind='loadout' data={data} />
                                    </td>
                                    <td>
                                        <PickCell
                                            pick={o.worst.theirs}
                                            kind='loadout'
                                            data={data}
                                        />
                                    </td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// ---------------------------------------------------------------------------
// Maps
// ---------------------------------------------------------------------------

function HeatCell({ record }: { record: Wld | undefined }) {
    const games = gamesOf(record);
    if (!games) return <td className='h2h-heat h2h-heat--none'>·</td>;
    return (
        <td
            className={`h2h-heat${games < 2 ? ' h2h-heat--small' : ''}`}
            style={{ background: rateColor(rateOf(record)) }}
            title={recordTitle(record!)}
        >
            {formatRecord(record!)}
        </td>
    );
}

/** Rows: maps. Columns: all opponents together, then each one. Cells: the record on that map. */
export function H2hMapGrid({ data, slots }: TableProps) {
    const columns = rowsOf(data, slots)
        .map(({ o }) => o)
        .filter((o): o is H2hOpponent => !!o && gamesOf(o.record) > 0);
    const total = data.total.maps;
    const keys = Object.keys(total).sort((a, b) => gamesOf(total[b]) - gamesOf(total[a]));

    if (keys.length === 0) {
        return (
            <p className='profile-panel__empty'>No game against these players {inScope(data)}.</p>
        );
    }

    return (
        <div className='h2h-scroll'>
            <table className='h2h-table h2h-grid'>
                <thead>
                    <tr>
                        <th scope='col'>Map</th>
                        <th scope='col'>All of them</th>
                        {columns.map((o) => (
                            <th
                                key={o.userId}
                                scope='col'
                                className='h2h-grid__player'
                                title={playerLabel(o)}
                            >
                                <SlotAvatar id={o.userId} name={playerLabel(o)} size={24} />
                                <span>{playerLabel(o)}</span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {keys.map((key) => (
                        <tr key={key}>
                            <th scope='row'>{formatMap(data.labels.maps[key]?.map ?? key)}</th>
                            <td>
                                <RateCell record={total[key]} />
                                <span className='h2h-grid__games'>{formatRecord(total[key]!)}</span>
                            </td>
                            {columns.map((o) => (
                                <HeatCell key={o.userId} record={o.maps[key]} />
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
