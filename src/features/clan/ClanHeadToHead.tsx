import { useMemo, useState, type CSSProperties } from 'react';
import Panel from '@/components/panel/Panel';
import PanelEmpty from '@/components/panel/PanelEmpty';
import SeasonNote from '@/components/season-note/SeasonNote';
import SegmentedControl from '@/components/segmented-control/SegmentedControl';
import ErrorState from '@/components/status/ErrorState';
import { CLAN_H2H_SLOTS } from '@/config/compare';
import { H2H_SCOPES } from '@/config/profile';
import H2hSummary from '@/features/compare/H2hSummary';
// shared: the profile's head to head card
import '@/features/profile/HeadToHead.scss';
import type useClanOverview from '@/hooks/queries/useClanOverview';
import useClans from '@/hooks/queries/useClans';
import useClanSlots, { resetClanSlots, setClanSlot } from '@/hooks/useClanSlots';
import type { Wld } from '@/types/record';
import { formatNumber } from '@/utils/format';
import { formatRecord, gamesOf, recordTitle } from '@/utils/record';
import { seasonTitle } from '@/utils/season';
import { fillSlots } from '@/utils/slots';
import ClanH2hRow from './ClanH2hRow';
import ClanSelect from './ClanSelect';

interface ClanHeadToHeadProps {
    clanId: string;
    overview: ReturnType<typeof useClanOverview>;
}

/**
 * Clan card: its members' games against each of 10 clans, this season or in every season:
 * the top clans (the best win rates of the season, weighted by the games played), where
 * every slot the visitor replaced shows their pick instead.
 */
export default function ClanHeadToHead(props: ClanHeadToHeadProps) {
    const { clanId, overview } = props;
    const { data, isLoading, error, refetch } = overview;

    const [allSeasons, setAllSeasons] = useState(false);
    const clans = useClans();
    const overrides = useClanSlots();
    const top = data?.headToHead.top;
    const slots = useMemo(
        () =>
            fillSlots(
                (top ?? []).map((c) => c.id),
                overrides,
                clanId,
                CLAN_H2H_SLOTS,
            ),
        [top, overrides, clanId],
    );
    // every clan that can be named: the list, or the top clans until it comes
    const known = useMemo(
        () => new Map([...(top ?? []), ...(clans.data ?? [])].map((c) => [c.id, c])),
        [top, clans.data],
    );

    const scope = (
        <SegmentedControl
            aria-label='Games counted'
            options={H2H_SCOPES}
            value={allSeasons ? 'all' : 'season'}
            onChange={(value) => setAllSeasons(value === 'all')}
        />
    );

    if (isLoading) {
        return (
            <Panel className='h2h-card' title='Head to head' actions={scope} aria-busy='true'>
                <PanelEmpty>Looking up games against the top clans…</PanelEmpty>
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

    const records = new Map(
        (allSeasons ? data.headToHead.all : data.headToHead.season).map((r) => [r.id, r]),
    );
    const ids = slots.map((slot) => slot.id);
    const rows = ids.flatMap((id) => records.get(id) ?? []);
    const total = rows.reduce<Wld>(
        (sum, row) => [sum[0] + row.record[0], sum[1] + row.record[1], sum[2] + row.record[2]],
        [0, 0, 0],
    );
    const totalGames = gamesOf(total);
    // the record column: as wide as the longest record shown
    const recordChars = Math.max(...rows.map((row) => formatRecord(row.record).length), 0);
    const met = rows.filter((row) => gamesOf(row.record) > 0).length;
    const where = allSeasons
        ? 'in any season'
        : data.liveSeason
          ? `in ${seasonTitle(data.liveSeason.name)}`
          : 'this season';

    return (
        <Panel className='h2h-card' title='Head to head' actions={scope}>
            {slots.length === 0 ? (
                <PanelEmpty>No other clan with a known player yet.</PanelEmpty>
            ) : (
                <>
                    <div className='h2h-card__top'>
                        <H2hSummary record={total}>
                            {totalGames === 0 ? (
                                <>No game against these clans {where}.</>
                            ) : (
                                <>
                                    <strong title={recordTitle(total)}>
                                        {formatRecord(total)}
                                    </strong>{' '}
                                    against these clans, {formatNumber(totalGames)} games, met{' '}
                                    {formatNumber(met)} of {formatNumber(slots.length)}
                                </>
                            )}
                        </H2hSummary>
                    </div>

                    <ol
                        className='h2h-list'
                        style={{ '--record-chars': recordChars } as CSSProperties}
                    >
                        {slots.map((slot) => (
                            <ClanH2hRow
                                key={slot.index}
                                clanId={clanId}
                                id={slot.id}
                                name={known.get(slot.id)?.name ?? 'Unknown clan'}
                                row={records.get(slot.id)}
                                season={allSeasons ? 'all' : undefined}
                                scope={where}
                                select={
                                    <ClanSelect
                                        slot={slot}
                                        clan={known.get(slot.id)}
                                        clans={clans.data ?? top ?? []}
                                        taken={
                                            new Set([clanId, ...ids.filter((id) => id !== slot.id)])
                                        }
                                        onChange={(id) => setClanSlot(slot.index, id)}
                                    />
                                }
                            />
                        ))}
                    </ol>
                </>
            )}

            {allSeasons && <SeasonNote season='all' />}

            {slots.some((slot) => slot.custom) && (
                <div className='h2h-card__foot'>
                    <button
                        type='button'
                        className='text-link h2h-card__reset'
                        onClick={resetClanSlots}
                    >
                        Back to the top clans
                    </button>
                </div>
            )}
        </Panel>
    );
}
