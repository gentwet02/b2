export interface Stats {
    wins: number;
    draws: number;
    losses: number;
    win_streak: number;
    highest_win_streak: number;
    no_lives_lost: number;
    first_bloons: number;
}

export interface Accolade {
    type: string;
    subtype: string;
    value: number;
}

export interface BloonStat {
    bloon_type: string;
    sends: number;
    pops: number;
}

export interface Tower {
    type: string;
    used: number;
    unlocked: boolean;
}

export interface UserProfile {
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
}

/**
 * One season of a player, from the profile readings our server stores (NK's ranked stats are
 * lifetime numbers: a season is the difference between two readings).
 */
export interface ProfileSeason {
    seasonId: number;
    wins: number;
    draws: number;
    losses: number;
    /** current streak at the last reading of the season */
    winStreak: number;
    bestWinStreak: number;
    /** false: counted from our first reading in that season, earlier games are missing */
    complete: boolean;
    equipped: {
        avatar: string | null;
        banner: string | null;
        border: string | null;
        title: string | null;
        badges: { season: number | null; name: string; iconURL: string | null }[];
    };
    firstSeen: string;
    lastSeen: string;
}

/** GET /users/:id — the stored profile, in Ninja Kiwi's shape, plus our season records. */
export interface UserProfileData {
    body: UserProfile;
    error: string | null;
    message?: string | null;
    success: boolean;
    /** season records, newest first */
    seasons?: ProfileSeason[];
    /** when our server last read this profile from Ninja Kiwi */
    fetchedAt?: string;
}

export interface UserSearch {
    matches?: number | undefined;
    seasons?: number | undefined;
}

/** GET /users/:id/season: heroes and counts from the matches our server recorded, record and streaks from the stored profile. */
export interface SeasonStats {
    seasonId: number;
    seasonName: string;
    recorded: number;
    wins: number;
    losses: number;
    draws: number;
    /** cancelled games and lobby disconnects */
    other: number;
    /** from the stored profile readings; null when we have none this season */
    winStreak: number | null;
    bestWinStreak: number | null;
    /** the season from the profile readings (W/D/L, streaks), null when we have none */
    record: ProfileSeason | null;
    heroes: { hero: string; played: number; wins: number; portrait?: string }[];
    firstSeen: string | null;
    lastSeen: string | null;
    message?: string | null;
    error?: string | null;
}

/** A player's games in one season, from the matches our server recorded (HoM vs HoM). */
export interface PlayerSeasonRecord {
    seasonId: number;
    wins: number;
    draws: number;
    losses: number;
}

export interface PlayerSeasonRecords {
    seasons: PlayerSeasonRecord[];
    message?: string | null;
    error?: string | null;
}

export interface SeasonRank {
    seasonId: number;
    name: string;
    rank: number;
    score: number;
    final: boolean;
}

/** GET /users/:id/ranks */
export interface RankHistory {
    current: SeasonRank | null;
    /** best finish of a finished season */
    best: SeasonRank | null;
    seasons: SeasonRank[];
    message?: string | null;
    error?: string | null;
}
