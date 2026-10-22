import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import Panel from '@/components/panel/Panel';
import ErrorState from '@/components/status/ErrorState';
import { playerQueryPrefixes, queryKeys } from '@/hooks/queries/keys';
import usePlayerName from '@/hooks/queries/usePlayerName';
import useProfile from '@/hooks/queries/useProfile';
import useCachedPlayerName from '@/hooks/useCachedPlayerName';
import { timeAgo } from '@/utils/format';
import Accolades from './Accolades';
import AllTimeStats from './AllTimeStats';
import BloonStats from './BloonStats';
import HeadToHead from './HeadToHead';
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
    const { data: alias } = usePlayerName(userId);
    const cachedName = useCachedPlayerName(userId);
    const refreshing =
        useIsFetching({ queryKey: queryKeys.profile(userId) }) +
            useIsFetching({ queryKey: queryKeys.seasonStats(userId) }) >
        0;

    const profile = data?.body;

    const refresh = () => {
        for (const queryKey of playerQueryPrefixes(userId)) {
            void queryClient.invalidateQueries({ queryKey });
        }
    };

    return (
        <div className='profile'>
            {profile ? (
                <ProfileHero
                    profile={profile}
                    alias={alias}
                    note={data?.fetchedAt ? `Updated ${timeAgo(data.fetchedAt)}` : null}
                    actions={
                        <button
                            type='button'
                            className='button button--quiet'
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

            <div className='profile__stats'>
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
                        <BloonStats bloons={profile._bloonStats ?? []} />
                    </div>
                    <Panel title='Trophies and arenas'>
                        <SeasonStrip profile={profile} />
                    </Panel>
                    <Accolades accolades={profile.accolades ?? []} />
                </>
            )}
        </div>
    );
}
