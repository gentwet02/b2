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
}
