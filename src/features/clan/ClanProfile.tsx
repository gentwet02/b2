import { Link } from '@tanstack/react-router';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import StatusMessage from '@/components/status/StatusMessage';
import '@/features/profile/UserProfile.scss';
import useClan, { isMissingClan } from '@/hooks/queries/useClan';
import useClanOverview from '@/hooks/queries/useClanOverview';
import { seasonTitle } from '@/utils/season';
import ClanHeadToHead from './ClanHeadToHead';
import ClanHero from './ClanHero';
import ClanMatches from './ClanMatches';
import ClanMembers from './ClanMembers';
import ClanRecord from './ClanRecord';
import ClanSeasons from './ClanSeasons';
import LiveTag from '@/components/live-tag/LiveTag';

interface ClanProfileProps {
    clanId: string;
}

/**
 * A clan's page: the clan, its known members' games added up
 * (the live season, or the last one they played in, from the recorded matches; all time from
 * Ninja Kiwi's numbers), season by season, against the top clans, the members and their
 * latest matches.
 */
export default function ClanProfile(props: ClanProfileProps) {
    const { clanId } = props;

    const { data, isLoading, error, refetch } = useClan(clanId);
    const overview = useClanOverview(clanId, !!data);
    const stats = overview.data;

    // no such clan: one message, not an error in every section
    if (isMissingClan(error)) {
        return (
            <StatusMessage
                title='No such clan'
                action={
                    <Link to='/' className='button'>
                        Go to the live leaderboard
                    </Link>
                }
            >
                {error?.message}
            </StatusMessage>
        );
    }
    if (isLoading) return <Loading label='Loading the clan…' />;
    if (error || !data) {
        return (
            <ErrorState title="Couldn't load this clan" error={error} onRetry={() => refetch()} />
        );
    }

    const known = data.members.length;
    const record = {
        loading: overview.isLoading,
        error: overview.error,
        onRetry: () => void overview.refetch(),
    };

    return (
        <div className='profile'>
            <ClanHero clan={data.clan} known={known} />

            <div className='profile__columns--even'>
                <ClanRecord
                    {...record}
                    accent
                    known={known}
                    title={
                        <>
                            {stats?.season ? seasonTitle(stats.season.name) : 'This season'}
                            {stats?.season?.live && <LiveTag small />}
                        </>
                    }
                    totals={stats?.season ?? undefined}
                    empty='No ranked match recorded for this clan this season yet.'
                />
                <ClanRecord
                    {...record}
                    title='Ranked, all time'
                    totals={stats?.allTime}
                    empty='No ranked game in the profiles of this clan’s players.'
                />
            </div>

            <ClanSeasons seasons={stats?.seasons ?? []} />

            <ClanHeadToHead clanId={clanId} overview={overview} />

            <ClanMembers members={data.members} total={data.clan.members} overview={stats} />

            <ClanMatches clanId={clanId} members={data.members} />
        </div>
    );
}
