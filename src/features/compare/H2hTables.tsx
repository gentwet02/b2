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
    playerLabel,
    rateColor,
    rateOf,
    recordTitle,
} from '@/utils/compare';
import { formatMap, formatNumber, timeAgo } from '@/utils/format';
import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import OpponentSelect from './OpponentSelect';

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

function SlotAvatar({ id, name }: { id: string; name: string }) {
    const src = usePlayerAvatar(id);
    return <PlayerAvatar className='lb-player__avatar' src={src} name={name} size={36} lazy />;
}

interface OverviewProps {
    data: HeadToHead;
    userId: string;
    slots: OpponentSlot[];
    players: RankedPlayer[];
    onSlot: (index: number, id: string | null) => void;
}

/** One row per slot: the select, then every head-to-head number against that player. */
export function H2hOverview({ data, userId, slots, players, onSlot }: OverviewProps) {
    const byId = new Map(data.opponents.map((o) => [o.userId, o]));
    const ids = slots.map((s) => s.id);

    return (
        <div className='h2h-table-wrap'>
            <table className='h2h-table'>
                <thead>
                    <tr>
                        <th scope='col'>Opponent</th>
                        <th scope='col'>Games</th>
                        <th scope='col'>W–L</th>
                        <th scope='col'>Win rate</th>
                        <th scope='col'>Best map</th>
                        <th scope='col'>Worst map</th>
                        <th scope='col'>Your best loadout</th>
                        <th scope='col'>Your worst loadout</th>
                        <th scope='col'>Their main loadout</th>
                        <th scope='col'>Last met</th>
                    </tr>
                </thead>
                <tbody>
                    {slots.map((slot) => {
                        const o = byId.get(slot.id);
                        const games = gamesOf(o?.record);
                        const name = o ? playerLabel(o) : 'Unknown player';
                        return (
                            <tr key={slot.index}>
                                <th scope='row'>
                                    <span className='h2h-table__opponent'>
                                        <SlotAvatar id={slot.id} name={name} />
                                        <OpponentSelect
                                            slot={slot}
                                            players={players}
                                            taken={
                                                new Set([
                                                    userId,
                                                    ...ids.filter((id) => id !== slot.id),
                                                ])
                                            }
                                            fallbackName={o ? name : undefined}
                                            onChange={(id) => onSlot(slot.index, id)}
                                        />
                                        <Link
                                            to='/user/$userId'
                                            params={{ userId: slot.id }}
                                            className='h2h-table__profile'
                                            aria-label={`Open ${name}'s profile`}
                                            title='Open profile'
                                        >
                                            ↗
                                        </Link>
                                    </span>
                                </th>
                                {!o ? (
                                    <td colSpan={9} className='lb-num--empty'>
                                        Loading…
                                    </td>
                                ) : games === 0 ? (
                                    <td colSpan={9} className='lb-num--empty'>
                                        Never met in {data.seasonName.replace(' Event', '')}
                                    </td>
                                ) : (
                                    <>
                                        <td className='lb-num'>{formatNumber(games)}</td>
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
                                        <td>
                                            <PickCell
                                                pick={o.best.mine}
                                                kind='loadout'
                                                data={data}
                                            />
                                        </td>
                                        <td>
                                            <PickCell
                                                pick={o.worst.mine}
                                                kind='loadout'
                                                data={data}
                                            />
                                        </td>
                                        <td>
                                            <PickCell
                                                pick={o.top.theirs}
                                                kind='loadout'
                                                data={data}
                                            />
                                        </td>
                                        <td className='h2h-table__soft'>
                                            {timeAgo(o.lastMet) ?? '–'}
                                        </td>
                                    </>
                                )}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

function HeatCell({ record }: { record: Wld | undefined }) {
    const games = gamesOf(record);
    if (!games) return <td className='h2h-heat h2h-heat--none'>·</td>;
    const rate = rateOf(record);
    return (
        <td
            className={`h2h-heat${games < 2 ? ' h2h-heat--small' : ''}`}
            style={{ background: rateColor(rate) }}
            title={recordTitle(record!)}
        >
            {formatRecord(record!)}
        </td>
    );
}

/** Rows: maps. Columns: all opponents together, then each one. Cells: your record on that map. */
export function H2hMapGrid({ data, slots }: { data: HeadToHead; slots: OpponentSlot[] }) {
    const byId = new Map(data.opponents.map((o) => [o.userId, o]));
    const columns = slots.map((s) => byId.get(s.id)).filter((o): o is H2hOpponent => !!o);
    const total = data.total.maps;
    const keys = Object.keys(total).sort((a, b) => gamesOf(total[b]) - gamesOf(total[a]));

    if (keys.length === 0) {
        return <p className='profile-panel__empty'>No game against these players yet.</p>;
    }

    return (
        <div className='h2h-table-wrap'>
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
                                {playerLabel(o)}
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
