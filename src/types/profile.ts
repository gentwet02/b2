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

/** GET /users/:id — Ninja Kiwi's answer, passed through by the server. */
export interface UserProfileData {
    body: UserProfile;
    error: string | null;
    message?: string | null;
    success: boolean;
    /** when our server got this copy from Ninja Kiwi */
    fetchedAt?: string;
}

/** GET /users/:id/season: computed from the matches our server recorded. */
export interface SeasonStats {
    seasonId: number;
    seasonName: string;
    recorded: number;
    wins: number;
    losses: number;
    draws: number;
    /** cancelled games and lobby disconnects */
    other: number;
    winStreak: number;
    bestWinStreak: number;
    heroes: { hero: string; played: number; wins: number; portrait?: string }[];
    firstSeen: string | null;
    lastSeen: string | null;
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
