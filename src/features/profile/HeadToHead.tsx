import { ChevronDownIcon } from '@/components/icons';
import { ErrorState } from '@/components/status/Status';
import H2hHighlights from '@/features/compare/H2hHighlights';
import OpponentSelect from '@/features/compare/OpponentSelect';
import useHeadToHead from '@/hooks/useHeadToHead';
import useOpponentSlots from '@/hooks/useOpponentSlots';
import type { CompareSeason, H2hOpponent, HeadToHead as HeadToHeadData } from '@/types/compare';
import {
    formatRate,
    formatRecord,
    gamesOf,
    playerLabel,
    rateOf,
    recordTitle,
} from '@/utils/compare';
import { formatNumber, timeAgo } from '@/utils/format';
import { Link } from '@tanstack/react-router';
import { useId, useMemo, useState, type ReactNode } from 'react';

interface RowProps {
    opponent: H2hOpponent | undefined;
    data: HeadToHeadData;
    open: boolean;
    onToggle: () => void;
    select: ReactNode;
}

function OpponentRow({ opponent, data, open, onToggle, select }: RowProps) {
    const detailsId = useId();
    const games = gamesOf(opponent?.record);
    const rate = rateOf(opponent?.record);

    return (
        <li className={`h2h-row${open ? ' h2h-row--open' : ''}`}>
            <div className='h2h-row__main'>
                {select}
                {!opponent ? (
                    <span className='h2h-row__none'>Loading…</span>
                ) : games === 0 ? (
                    <span className='h2h-row__none'>Never met</span>
                ) : (
                    <>
                        <span className='h2h-row__record' title={recordTitle(opponent.record)}>
                            {formatRecord(opponent.record)}
                        </span>
                        <span className='h2h-row__track' aria-hidden='true'>
                            <span style={{ width: `${rate ?? 0}%` }} />
                        </span>
                        <span className='h2h-row__rate'>{formatRate(rate)}</span>
                    </>
                )}
                <button
                    type='button'
                    className='h2h-row__toggle'
                    aria-expanded={open}
                    aria-controls={detailsId}
                    aria-label={open ? 'Hide maps and loadouts' : 'Show maps and loadouts'}
                    disabled={!opponent || games === 0}
                    onClick={onToggle}
                >
                    <ChevronDownIcon width={14} height={14} rotate={open} aria-hidden='true' />
                </button>
            </div>
            {open && opponent && games > 0 && (
                <div id={detailsId} className='h2h-row__details'>
                    <p className='h2h-row__meta'>
                        {formatNumber(games)} {games === 1 ? 'game' : 'games'}
                        {opponent.lastMet && <> · last met {timeAgo(opponent.lastMet)}</>}
                    </p>
                    <H2hHighlights
                        summary={opponent}
                        labels={data.labels}
                        min={data.minGames.opponent}
                    />
                </div>
            )}
        </li>
    );
}

/** Profile card: the player's games against each of 10 opponents (top 10 by default). */
export default function HeadToHead({ userId }: { userId: string }) {
    const [allSeasons, setAllSeasons] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const season: CompareSeason | undefined = allSeasons ? 'all' : undefined;

    const { slots, ids, players, ready, setSlot, reset, hasCustom } = useOpponentSlots(
        userId,
        season,
    );
    const { data, isLoading, error, refetch, isPlaceholderData } = useHeadToHead(
        userId,
        ids,
        season,
        ready,
    );

    const byId = useMemo(() => new Map((data?.opponents ?? []).map((o) => [o.userId, o])), [data]);

    const head = (
        <div className='profile-panel__head'>
            <h2 className='profile-panel__title'>Head to head</h2>
            <div className='h2h-scope' role='group' aria-label='Games counted'>
                <button
                    type='button'
                    className='h2h-scope__option'
                    aria-pressed={!allSeasons}
                    onClick={() => setAllSeasons(false)}
                >
                    This season
                </button>
                <button
                    type='button'
                    className='h2h-scope__option'
                    aria-pressed={allSeasons}
                    onClick={() => setAllSeasons(true)}
                >
                    All seasons
                </button>
            </div>
        </div>
    );

    if (isLoading || (!data && !ready)) {
        return (
            <section className='profile-panel h2h-card' aria-busy='true'>
                {head}
                <p className='profile-panel__empty'>Looking up games against the top 10…</p>
            </section>
        );
    }
    if (error || !data) {
        return (
            <section className='profile-panel h2h-card'>
                {head}
                <ErrorState error={error} onRetry={() => refetch()} />
            </section>
        );
    }

    const totalGames = gamesOf(data.total.record);
    const met = data.opponents.filter((o) => gamesOf(o.record) > 0).length;

    return (
        <section
            className={`profile-panel h2h-card${isPlaceholderData ? ' h2h-card--updating' : ''}`}
        >
            {head}

            <div className='h2h-summary'>
                <span className='h2h-summary__rate'>{formatRate(rateOf(data.total.record))}</span>
                <span className='h2h-summary__text'>
                    {totalGames === 0 ? (
                        <>No game against these players in {data.seasonName.toLowerCase()}.</>
                    ) : (
                        <>
                            <strong title={recordTitle(data.total.record)}>
                                {formatRecord(data.total.record)}
                            </strong>{' '}
                            against these players, {formatNumber(totalGames)} games, met {met} of{' '}
                            {data.opponents.length}
                        </>
                    )}
                </span>
            </div>

            <ol className='h2h-list'>
                {slots.map((slot) => {
                    const opponent = byId.get(slot.id);
                    const taken = new Set([userId, ...ids.filter((id) => id !== slot.id)]);
                    return (
                        <OpponentRow
                            key={slot.index}
                            opponent={opponent}
                            data={data}
                            open={openId === slot.id}
                            onToggle={() => setOpenId(openId === slot.id ? null : slot.id)}
                            select={
                                <OpponentSelect
                                    slot={slot}
                                    players={players}
                                    taken={taken}
                                    fallbackName={opponent ? playerLabel(opponent) : undefined}
                                    onChange={(id) => setSlot(slot.index, id)}
                                />
                            }
                        />
                    );
                })}
            </ol>

            <div className='h2h-card__foot'>
                {hasCustom ? (
                    <button type='button' className='text-link h2h-card__reset' onClick={reset}>
                        Back to the top 10
                    </button>
                ) : (
                    <span className='profile-panel__note'>
                        Replace any player with the select. Your picks are kept for every profile.
                    </span>
                )}
                <Link
                    to='/user/$userId/compare'
                    params={{ userId }}
                    search={{ season }}
                    className='button button--quiet'
                >
                    Full head to head
                </Link>
            </div>
        </section>
    );
}
