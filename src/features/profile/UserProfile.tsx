import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';
import Panel from '@/components/panel/Panel';
import ErrorState from '@/components/status/ErrorState';
import StatusMessage from '@/components/status/StatusMessage';
import { playerQueryPrefixes, queryKeys } from '@/hooks/queries/keys';
import usePlayerName from '@/hooks/queries/usePlayerName';
import useProfile, { isMissingProfile } from '@/hooks/queries/useProfile';
import useCachedPlayerName from '@/hooks/useCachedPlayerName';
import { timeAgo } from '@/utils/format';
import AllTimeStats from './AllTimeStats';
import BloonStats from './BloonStats';
import ClanCard from './ClanCard';
import HeadToHead from './HeadToHead';
import Medals from './Medals';
import ProfileHero from './ProfileHero';
import ProfileHeroPlaceholder from './ProfileHeroPlaceholder';
import RecentMatches from './RecentMatches';
import SeasonHistory from './SeasonHistory';
import SeasonRecord from './SeasonRecord';
import SeasonStrip from './SeasonStrip';
import TowerUsage from './TowerUsage';

interface UserProfileProps {
    userId: string;
}

export default function UserProfile(props: UserProfileProps) {
    const { userId } = props;

    const queryClient = useQueryClient();
    const { data, isLoading, error, refetch } = useProfile(userId);
    const { data: known } = usePlayerName(userId);
    const cachedName = useCachedPlayerName(userId);
    const refreshing =
        useIsFetching({ queryKey: queryKeys.profile(userId) }) +
            useIsFetching({ queryKey: queryKeys.seasonStats(userId) }) >
        0;

    const profile = data?.body;
    const missing = isMissingProfile(error);

    function refresh() {
        for (const queryKey of playerQueryPrefixes(userId)) {
            void queryClient.invalidateQueries({ queryKey });
        }
    }

    // no such player: one message, not an error in every section
    if (missing) {
        return (
            <StatusMessage
                title='No such player'
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

    return (
        <div className='profile'>
            {profile ? (
                <ProfileHero
                    profile={profile}
                    alias={known?.alias}
                    tag={known?.tag}
                    oldNames={data?.names}
                    note={data?.fetchedAt ? `Updated ${timeAgo(data.fetchedAt)}` : null}
                    actions={
                        <button
                            type='button'
                            className='button--quiet'
                            onClick={refresh}
                            disabled={refreshing}
                        >
                            {refreshing ? 'Refreshing…' : 'Refresh'}
                        </button>
                    }
                />
            ) : (
                <ProfileHeroPlaceholder name={cachedName}>
                    {isLoading && <p className='profile-hero__alias'>Loading the profile…</p>}
                    {error && (
                        <ErrorState
                            title="Couldn't load this profile"
                            error={error}
                            onRetry={() => refetch()}
                        />
                    )}
                </ProfileHeroPlaceholder>
            )}

            <div className='profile__columns--even'>
                <SeasonRecord userId={userId} />
                <AllTimeStats userId={userId} stats={profile?.rankedStats} loading={isLoading} />
            </div>

            <SeasonHistory userId={userId} />

            <HeadToHead userId={userId} />

            <RecentMatches userId={userId} playerName={profile?.displayName ?? cachedName} />

            {profile && (
                <>
                    <div className='profile__columns'>
                        <TowerUsage towers={profile._towers ?? []} />
                        <TowerUsage towers={profile._towers ?? []} heroes />
                    </div>
                    <div className='profile__columns'>
                        <BloonStats bloons={profile._bloonStats ?? []} />
                        <BloonStats bloons={profile._bloonStats ?? []} moabs />
                    </div>
                    {data?.clan ? (
                        <div className='profile__columns--even'>
                            <ClanCard clan={data.clan} />
                            <Panel title='Trophies and arenas'>
                                <SeasonStrip profile={profile} compact />
                            </Panel>
                        </div>
                    ) : (
                        <Panel title='Trophies and arenas'>
                            <SeasonStrip profile={profile} />
                        </Panel>
                    )}
                    <Medals medals={profile.badges_all} />
                </>
            )}
        </div>
    );
}
