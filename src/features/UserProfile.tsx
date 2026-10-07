import { ErrorState, Loading } from '@/components/status/Status';
import usePlayerName from '@/hooks/usePlayerName';
import useProfile from '@/hooks/useProfile';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import Accolades from '@/features/profile/Accolades';
import BloonStats from '@/features/profile/BloonStats';
import ProfileHero from '@/features/profile/ProfileHero';
import RecentMatches from '@/features/profile/RecentMatches';
import SeasonStrip from '@/features/profile/SeasonStrip';
import StatsPanel from '@/features/profile/StatsPanel';
import TowerUsage from '@/features/profile/TowerUsage';

interface UserProfileProps {
    userId: string;
}

export default function UserProfile({ userId }: UserProfileProps) {
    const queryClient = useQueryClient();
    const { data, isLoading, error, refetch } = useProfile(userId);
    const { data: realName } = usePlayerName(userId);
    const refreshing =
        useIsFetching({ queryKey: ['userProfile', userId] }) +
            useIsFetching({ queryKey: ['userMatches', userId] }) >
        0;

    if (isLoading) return <Loading label='Loading profile…' />;
    if (error || !data) {
        return (
            <ErrorState
                title="Couldn't load this profile"
                error={error}
                onRetry={() => refetch()}
            />
        );
    }

    const profile = data.body;

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
        queryClient.invalidateQueries({ queryKey: ['userMatches', userId] });
    };

    return (
        <div className='profile'>
            <ProfileHero
                profile={profile}
                realName={realName}
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

            <SeasonStrip profile={profile} />

            <div className='profile__stats'>
                {profile.rankedStats && (
                    <StatsPanel title='Ranked' stats={profile.rankedStats} accent />
                )}
                {profile.casualStats && <StatsPanel title='Casual' stats={profile.casualStats} />}
            </div>

            <RecentMatches userId={userId} />

            <div className='profile__columns'>
                <TowerUsage towers={profile._towers ?? []} />
                <BloonStats bloons={profile._bloonStats ?? []} />
            </div>

            <Accolades accolades={profile.accolades ?? []} />
        </div>
    );
}
