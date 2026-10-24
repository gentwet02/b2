import { Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import Panel from '@/components/panel/Panel';
import PanelEmpty from '@/components/panel/PanelEmpty';
import SegmentedControl from '@/components/segmented-control/SegmentedControl';
import ErrorState from '@/components/status/ErrorState';
import { H2H_SCOPES } from '@/config/profile';
import H2hSummary from '@/features/compare/H2hSummary';
import OpponentSelect from '@/features/compare/OpponentSelect';
import useHeadToHead from '@/hooks/queries/useHeadToHead';
import useOpponentSlots from '@/hooks/useOpponentSlots';
import { formatNumber } from '@/utils/format';
import { playerLabel } from '@/utils/player';
import { formatRecord, gamesOf, recordTitle } from '@/utils/record';
import { inScope } from '@/utils/season';
import H2hOpponentRow from './H2hOpponentRow';

interface HeadToHeadProps {
    userId: string;
}

/** Profile card: the player's games against each of 10 opponents (top 10 by default). */
export default function HeadToHead(props: HeadToHeadProps) {
    const { userId } = props;

    const [allSeasons, setAllSeasons] = useState(false);
    const [openId, setOpenId] = useState<string | null>(null);
    const season = allSeasons ? 'all' : undefined;

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

    const scope = (
        <SegmentedControl
            aria-label='Games counted'
            options={H2H_SCOPES}
            value={allSeasons ? 'all' : 'season'}
            onChange={(value) => setAllSeasons(value === 'all')}
        />
    );

    if (isLoading || (!data && !ready)) {
        return (
            <Panel className='h2h-card' title='Head to head' actions={scope} aria-busy='true'>
                <PanelEmpty>Looking up games against the top 10…</PanelEmpty>
            </Panel>
        );
    }
    if (error || !data) {
        return (
            <Panel className='h2h-card' title='Head to head' actions={scope}>
                <ErrorState error={error} onRetry={() => refetch()} />
            </Panel>
        );
    }

    const totalGames = gamesOf(data.total.record);
    const met = data.opponents.filter((o) => gamesOf(o.record) > 0).length;

    return (
        <Panel
            className={`h2h-card${isPlaceholderData ? ' h2h-card--updating' : ''}`}
            title='Head to head'
            actions={scope}
        >
            <H2hSummary record={data.total.record}>
                {totalGames === 0 ? (
                    <>No game against these players {inScope(data)}.</>
                ) : (
                    <>
                        <strong title={recordTitle(data.total.record)}>
                            {formatRecord(data.total.record)}
                        </strong>{' '}
                        against these players, {formatNumber(totalGames)} games, met {formatNumber(met)} of{' '}
                        {formatNumber(data.opponents.length)}
                    </>
                )}
            </H2hSummary>

            <ol className='h2h-list'>
                {slots.map((slot) => {
                    const opponent = byId.get(slot.id);
                    const name =
                        (opponent && playerLabel(opponent)) ||
                        playerLabel(players.find((p) => p.id === slot.id) ?? {});
                    const taken = new Set([userId, ...ids.filter((id) => id !== slot.id)]);
                    return (
                        <H2hOpponentRow
                            key={slot.index}
                            id={slot.id}
                            name={name}
                            opponent={opponent}
                            data={data}
                            open={openId === slot.id}
                            onToggle={() => setOpenId(openId === slot.id ? null : slot.id)}
                            select={
                                <OpponentSelect
                                    slot={slot}
                                    players={players}
                                    taken={taken}
                                    fallbackName={opponent ? name : undefined}
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
                    <span className='panel__note'>
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
        </Panel>
    );
}
