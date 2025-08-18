import { useQuery } from '@tanstack/react-query';

interface Stats {
    wins: number;
    draws: number;
    losses: number;
    win_streak: number;
    highest_win_streak: number;
    no_lives_lost: number;
    first_bloons: number;
}

interface Accolade {
    type: string;
    subtype: string;
    value: number;
}

interface BloonStat {
    bloon_type: string;
    sends: number;
    pops: number;
}

interface Tower {
    type: string;
    used: number;
    unlocked: boolean;
}

interface UserProfileData {
    body: {
        displayName: string;
        is_vip: boolean;
        is_club_member: boolean;
        equippedAvatar: string;
        equippedAvatarURL: string;
        equippedBanner: string;
        equippedBannerURL: string;
        equippedBorder: string;
        equippedBorderURL: string;
        equippedTitle: string;
        casualStats: Stats;
        rankedStats: Stats;
        badges_equipped: unknown[];
        badges_all: unknown[];
        chests: string[];
        chestsOpened: number;
        currentSeason: string;
        currentSeason_highestArena: string;
        currentSeason_highestArenaIndex: number;
        currentSeason_trophies: number;
        lifetime_highestArena: string;
        lifetime_highestArenaIndex: number;
        lifetime_trophies: number;
        matches: string;
        homs: string;
        accolades: Accolade[];
        arenaLeagueTier: number;
        inGuild: boolean;
        guild: string | null;
        _bloonStats: BloonStat[];
        _towers: Tower[];
    };
    error: string | null;
    success: boolean;
}

interface UserProfileProps {
    userId: string;
}

export default function UserProfile(props: UserProfileProps) {
    const { userId } = props;

    const { data, isLoading, error, refetch } = useQuery<UserProfileData>({
        queryKey: ['userProfile', userId],
        queryFn: async () => {
            const response = await fetch(`https://data.ninjakiwi.com/battles2/users/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user profile');
            return response.json();
        },
        enabled: !!userId,
    });

    if (isLoading) return <div className='profile__loading'>Loading profile...</div>;
    if (error) return <div className='profile__error'>Error: {error.message}</div>;
    if (!data?.body) return <div className='profile__error'>No profile data available</div>;

    const { body: profile } = data;
    const totalGames = profile.rankedStats.wins + profile.rankedStats.losses;
    const winRate =
        totalGames > 0 ? ((profile.rankedStats.wins / totalGames) * 100).toFixed(1) : '0';

    const getArenaName = (tier: number) => {
        const arenas = ['RBC', 'Yellow', 'Green', 'Blue', 'Red', 'White', 'Lead', 'Ceramic', 'HoM'];
        return arenas[tier] || 'Unknown';
    };

    return (
        <div className='profile'>
            <div className='profile__header'>
                <button onClick={() => refetch()} className='profile__refresh-btn'>
                    Refresh Profile
                </button>
            </div>

            {/* Player Card */}
            <div className='profile__card'>
                <div className='profile__avatar-section'>
                    <div className='profile__avatar-container'>
                        <img
                            src={profile.equippedAvatarURL}
                            alt='Player Avatar'
                            className='profile__avatar'
                        />
                        <img
                            src={profile.equippedBorderURL}
                            alt='Avatar Border'
                            className='profile__border'
                        />
                    </div>
                </div>

                <div className='profile__info'>
                    <h1 className='profile__name'>{profile.displayName}</h1>
                    <div className='profile__badges'>
                        {profile.is_club_member && (
                            <span className='profile__badge profile__badge--club'>Club Member</span>
                        )}
                        {profile.is_vip && (
                            <span className='profile__badge profile__badge--vip'>VIP</span>
                        )}
                    </div>
                    <div className='profile__arena'>
                        Current Arena:{' '}
                        <span className='profile__arena-name'>
                            {getArenaName(profile.arenaLeagueTier)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className='profile__stats-grid'>
                {/* Ranked Stats */}
                <div className='stats-card'>
                    <h3 className='stats-card__title'>Ranked Statistics</h3>
                    <div className='stats-card__content'>
                        <div className='stat-item'>
                            <span className='stat-item__label'>Wins</span>
                            <span className='stat-item__value stat-item__value--wins'>
                                {profile.rankedStats.wins.toLocaleString()}
                            </span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-item__label'>Losses</span>
                            <span className='stat-item__value stat-item__value--losses'>
                                {profile.rankedStats.losses.toLocaleString()}
                            </span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-item__label'>Win Rate</span>
                            <span className='stat-item__value'>{winRate}%</span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-item__label'>Win Streak</span>
                            <span className='stat-item__value'>
                                {profile.rankedStats.win_streak}
                            </span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-item__label'>Best Streak</span>
                            <span className='stat-item__value'>
                                {profile.rankedStats.highest_win_streak}
                            </span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-item__label'>Perfect Games</span>
                            <span className='stat-item__value'>
                                {profile.rankedStats.no_lives_lost}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Arena Info */}
                <div className='stats-card'>
                    <h3 className='stats-card__title'>Arena Progress</h3>
                    <div className='stats-card__content'>
                        <div className='stat-item'>
                            <span className='stat-item__label'>Current Arena</span>
                            <span className='stat-item__value'>
                                {getArenaName(profile.arenaLeagueTier)}
                            </span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-item__label'>Lifetime Best</span>
                            <span className='stat-item__value'>
                                {profile.lifetime_highestArena.toUpperCase()}
                            </span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-item__label'>Current Trophies</span>
                            <span className='stat-item__value'>
                                {profile.currentSeason_trophies.toLocaleString()}
                            </span>
                        </div>
                        <div className='stat-item'>
                            <span className='stat-item__label'>Lifetime Trophies</span>
                            <span className='stat-item__value'>
                                {profile.lifetime_trophies.toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Top Towers */}
            <div className='profile__section'>
                <h3 className='profile__section-title'>Most Used Towers</h3>
                <div className='towers-grid'>
                    {profile._towers
                        .filter((tower) => tower.used > 0)
                        .sort((a, b) => b.used - a.used)
                        .slice(0, 8)
                        .map((tower) => (
                            <div key={tower.type} className='tower-item'>
                                <div className='tower-item__name'>
                                    {tower.type.replace(/([A-Z])/g, ' $1').trim()}
                                </div>
                                <div className='tower-item__usage'>{tower.used} games</div>
                                <div className='tower-item__bar'>
                                    <div
                                        className='tower-item__bar-fill'
                                        style={{
                                            width: `${(tower.used / Math.max(...profile._towers.map((t) => t.used))) * 100}%`,
                                        }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Top Bloon Stats */}
            <div className='profile__section'>
                <h3 className='profile__section-title'>Bloon Statistics</h3>
                <div className='bloons-grid'>
                    {profile._bloonStats
                        .sort((a, b) => b.sends - a.sends)
                        .slice(0, 6)
                        .map((bloon) => (
                            <div key={bloon.bloon_type} className='bloon-item'>
                                <div className='bloon-item__type'>{bloon.bloon_type}</div>
                                <div className='bloon-item__stats'>
                                    <div className='bloon-stat'>
                                        <span className='bloon-stat__label'>Sent:</span>
                                        <span className='bloon-stat__value'>
                                            {bloon.sends.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className='bloon-stat'>
                                        <span className='bloon-stat__label'>Popped:</span>
                                        <span className='bloon-stat__value'>
                                            {bloon.pops.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                </div>
            </div>

            {/* Recent Accolades */}
            <div className='profile__section'>
                <h3 className='profile__section-title'>Recent Achievements</h3>
                <div className='accolades-grid'>
                    {profile.accolades.slice(0, 6).map((accolade, index) => (
                        <div key={index} className='accolade-item'>
                            <div className='accolade-item__type'>
                                {accolade.type.replace(/([A-Z])/g, ' $1').trim()}
                            </div>
                            {accolade.subtype !== 'None' && (
                                <div className='accolade-item__subtype'>{accolade.subtype}</div>
                            )}
                            <div className='accolade-item__value'>
                                {accolade.value.toLocaleString()}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
