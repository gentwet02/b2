import { ErrorState } from '@/components/status/Status';
import usePlayerName from '@/hooks/usePlayerName';
import useProfile from '@/hooks/useProfile';
import useRankHistory from '@/hooks/useRankHistory';
import type { LeaderboardResponse } from '@/types/leaderboard';
import { timeAgo } from '@/utils/format';
import { useIsFetching, useQueryClient } from '@tanstack/react-query';
import type React from 'react';
import Accolades from './profile/Accolades';
import BloonStats from './profile/BloonStats';
import ProfileHero, { ProfileHeroPlaceholder } from './profile/ProfileHero';
import RecentMatches from './profile/RecentMatches';
import SeasonRecord from './profile/SeasonRecord';
import SeasonStrip from './profile/SeasonStrip';
import StatsPanel from './profile/StatsPanel';
import TowerUsage from './profile/TowerUsage';

interface UserProfileProps {
    userId: string;
}

/** The player's name from a leaderboard already in the cache, to title the page at once. */
function useCachedName(userId: string) {
    const queryClient = useQueryClient();
    for (const [, data] of queryClient.getQueriesData<LeaderboardResponse>({
        queryKey: ['leaderboard'],
    })) {
        const player = data?.data?.find((p) => p.i === userId);
        if (player) return player.r || player.n;
    }
    return undefined;
}

/**
 * Every section loads on its own: the season record and the matches come from our
 * database and show right away, the Ninja Kiwi profile fills its parts when it arrives.
 */
export default function UserProfile({ userId }: UserProfileProps) {
    const queryClient = useQueryClient();
    const { data, isLoading, error, refetch } = useProfile(userId);
    const { data: realName } = usePlayerName(userId);
    const cachedName = useCachedName(userId);
    const { data: ranks } = useRankHistory(userId);
    const rankRows = [
        ranks?.best && {
            label: 'Best season finish',
            value: (
                <>
                    #{ranks.best.rank} <span className='stats-panel__sub'>{ranks.best.name}</span>
                </>
            ),
        },
        ranks?.current && {
            label: 'Rank this season',
            value: <>#{ranks.current.rank}</>,
        },
        ranks &&
            ranks.seasons.length > 0 && {
                label: 'Seasons in the Hall of Masters',
                value: <>{ranks.seasons.length}</>,
            },
    ].filter(Boolean) as { label: string; value: React.ReactNode }[];
    const refreshing =
        useIsFetching({ queryKey: ['userProfile', userId] }) +
            useIsFetching({ queryKey: ['seasonStats', userId] }) >
        0;

    const profile = data?.body;

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
        queryClient.invalidateQueries({ queryKey: ['seasonStats', userId] });
        queryClient.invalidateQueries({ queryKey: ['matchesHistory', { playerId: userId }] });
    };

    return (
        <div className='profile'>
            {profile ? (
                <ProfileHero
                    profile={profile}
                    realName={realName}
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
                    {isLoading && (
                        <p className='profile-hero__alias'>Loading the profile from Ninja Kiwi…</p>
                    )}
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
                {profile?.rankedStats ? (
                    <StatsPanel
                        title='Ranked, all time'
                        stats={profile.rankedStats}
                        extra={rankRows}
                    />
                ) : (
                    <section className='stats-panel stats-panel--loading' aria-busy={isLoading}>
                        <h2 className='stats-panel__title'>Ranked, all time</h2>
                        <p className='profile-panel__empty'>
                            {isLoading ? 'Loading…' : 'Not available.'}
                        </p>
                    </section>
                )}
            </div>

            <p className='profile__note'>
                This season's record counts the ranked matches our server recorded: matches played
                between two checks can be missing. Season finishes come from the leaderboards it
                stored.
            </p>

            <RecentMatches userId={userId} playerName={profile?.displayName ?? cachedName} />

            {profile && (
                <>
                    <div className='profile__columns'>
                        <TowerUsage towers={profile._towers ?? []} />
                        <BloonStats bloons={profile._bloonStats ?? []} />
                    </div>
                    <section className='profile-panel'>
                        <h2 className='profile-panel__title'>Trophies and arenas</h2>
                        <SeasonStrip profile={profile} />
                    </section>
                    <Accolades accolades={profile.accolades ?? []} />
                </>
            )}
        </div>
    );
}
