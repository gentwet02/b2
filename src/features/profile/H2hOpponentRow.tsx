import { Link } from '@tanstack/react-router';
import { useId, type ReactNode } from 'react';
import PlayerAvatar from '@/components/avatar/PlayerAvatar';
import { ChevronDownIcon } from '@/components/icons';
import H2hHighlights from '@/features/compare/H2hHighlights';
import usePlayerAvatar from '@/hooks/queries/usePlayerAvatar';
import { useSplitParams } from '@/hooks/useSplitVariants';
import type { H2hOpponent, HeadToHead } from '@/types/compare';
import { formatNumber, plural, timeAgo } from '@/utils/format';
import { formatRate, formatRecord, gamesOf, rateOf, recordTitle } from '@/utils/record';
import { inScope } from '@/utils/season';

interface H2hOpponentRowProps {
    id: string;
    name: string;
    opponent: H2hOpponent | undefined;
    data: HeadToHead;
    open: boolean;
    onToggle: () => void;
    select: ReactNode;
}

/** One opponent slot: avatar, select, record against them; opens on their maps and loadouts. */
export default function H2hOpponentRow(props: H2hOpponentRowProps) {
    const { id, name, opponent, data, open, onToggle, select } = props;

    const detailsId = useId();
    const split = useSplitParams();
    const avatar = usePlayerAvatar(id);
    const games = gamesOf(opponent?.record);
    const rate = rateOf(opponent?.record);

    return (
        <li className={`h2h-row${open ? ' h2h-row--open' : ''}`}>
            <div className='h2h-row__main'>
                <PlayerAvatar className='h2h-row__avatar' src={avatar} name={name} size={36} lazy />
                {select}
                {!opponent ? (
                    <span className='h2h-row__none'>Loading…</span>
                ) : games === 0 ? (
                    <span className='h2h-row__none'>Never met {inScope(data)}</span>
                ) : (
                    <>
                        <span className='h2h-row__record' title={recordTitle(opponent.record)}>
                            {formatRecord(opponent.record)}
                        </span>
                        <span className='h2h-row__track' aria-hidden='true'>
                            <span style={{ width: `${rate ?? 0}%` }} />
                        </span>
                        <span className='h2h-row__rate'>{formatRate(rate)}</span>
                        <span className='h2h-row__meta'>
                            {formatNumber(games)} {plural(games, 'game')}
                            {opponent.lastMet && (
                                <span className='h2h-row__last'>{timeAgo(opponent.lastMet)}</span>
                            )}
                        </span>
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
                    <Link
                        to='/user/$userId/compare'
                        params={{ userId: data.userId }}
                        search={{
                            season: data.season === 'all' ? 'all' : undefined,
                            vs: id,
                            ...split,
                        }}
                        className='text-link h2h-row__more'
                    >
                        Every game against {name} →
                    </Link>
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
