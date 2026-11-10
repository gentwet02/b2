import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
import PanelEmpty from '@/components/panel/PanelEmpty';
import ErrorState from '@/components/status/ErrorState';
import StatCard from '@/features/profile/StatCard';
import StatDetails from '@/features/profile/StatDetails';
import WinLossSummary from '@/features/profile/WinLossSummary';
import type { ClanPlayerPick, ClanRival, ClanTotals } from '@/types/clan';
import type { StatDetail } from '@/types/profile';
import { formatNumber, plural, timeAgo } from '@/utils/format';
import { playerLabel } from '@/utils/player';
import { formatRate, formatRecord, gamesOf, rateOf, recordTitle } from '@/utils/record';

interface ClanRecordProps {
    title: ReactNode;
    /** the highlighted card (this season) */
    accent?: boolean;
    /** the members' games added up; undefined: not there yet */
    totals: ClanTotals | undefined;
    /** the members our server knows: how many of them played is shown, and the last game */
    known?: number | undefined;
    loading: boolean;
    error: Error | null;
    onRetry: () => void;
    /** when the clan has no game in the scope */
    empty: string;
}


function rival(pick: ClanRival) {
    return (
        <>
            <Link
                to='/clan/$clanId'
                params={{ clanId: pick.clan.id }}
                className='clan-record__link'
                title={recordTitle(pick.record)}
            >
                {pick.clan.name}
            </Link>{' '}
            <span className='stats-panel__sub'>{formatRecord(pick.record)}</span>
        </>
    );
}

function player(pick: ClanPlayerPick, sub: string) {
    return (
        <>
            <Link
                to='/user/$userId'
                params={{ userId: pick.userId }}
                className='clan-record__link'
                title={recordTitle(pick.record)}
            >
                {playerLabel(pick)}
            </Link>{' '}
            <span className='stats-panel__sub'>{sub}</span>
        </>
    );
}

/**
 * One of the clan's two record cards (this season, all time): its known members' ranked games
 * added up, who played the most and the best, and the clans they meet and lose to the most.
 */
export default function ClanRecord(props: ClanRecordProps) {
    const { title, accent, totals, known, loading, error, onRetry, empty } = props;

    if (!totals) {
        return error ? (
            <StatCard title={title}>
                <ErrorState error={error} onRetry={onRetry} />
            </StatCard>
        ) : (
            <StatCard title={title} accent={!!accent} placeholder busy={loading}>
                <PanelEmpty>{loading ? 'Adding up the games…' : 'Not available.'}</PanelEmpty>
            </StatCard>
        );
    }

    const [wins, losses, draws] = totals.record;
    const details: StatDetail[] = [];
    if (totals.mostActive) {
        const games = gamesOf(totals.mostActive.record);
        details.push({
            label: 'Most active player',
            value: player(totals.mostActive, `${formatNumber(games)} ${plural(games, 'game')}`),
        });
    }
    if (totals.best) {
        details.push({
            label: 'Best player',
            value: player(totals.best, `${formatRate(rateOf(totals.best.record))} won`),
        });
    }
    const { mostPlayed, toughest } = totals.rivals;
    if (mostPlayed) details.push({ label: 'Most played clan', value: rival(mostPlayed) });
    if (toughest) details.push({ label: 'Toughest rival clan', value: rival(toughest) });
    if (known !== undefined) {
        details.push({
            label: 'Players with a game',
            value: (
                <>
                    {formatNumber(totals.players)}{' '}
                    <span className='stats-panel__sub'>of {formatNumber(known)} known</span>
                </>
            ),
        });
        if (totals.lastGame) details.push({ label: 'Last game', value: timeAgo(totals.lastGame) });
    }

    return (
        <StatCard title={title} accent={!!accent}>
            {gamesOf(totals.record) === 0 ? (
                <PanelEmpty>{empty}</PanelEmpty>
            ) : (
                <>
                    <WinLossSummary wins={wins} draws={draws} losses={losses} />
                    <StatDetails details={details} />
                </>
            )}
        </StatCard>
    );
}
