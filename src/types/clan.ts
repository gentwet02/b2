import type { BaseApiResponse } from '@/types/api';
import type { PlayerTag } from '@/types/player';
import type { SeasonRecord, Wld } from '@/types/record';

/** A clan (NK calls them guilds), as our server last read it. */
export interface Clan {
    id: string;
    name: string;
    bannerURL: string | null;
    tagline: string | null;
    /** every member, as NK counts them */
    members: number;
    /** OPEN | FILTERED | CLOSED */
    status: string;
    ownerId: string | null;
    /** the owner's name, when they are a player our server knows */
    ownerName: string | null;
}

/** A clan in the clans list: enough to pick one. */
export interface ClanSummary {
    id: string;
    name: string;
    bannerURL: string | null;
    members: number;
    /** the members our server knows: the HoM players it reads profiles of */
    known: number;
}

/** A known member of a clan. */
export interface ClanMember {
    userId: string;
    name: string | null;
    alias: string | null;
    tag: PlayerTag | null;
    /** rank and score in the live season's leaderboard */
    rank: number | null;
    score: number | null;
    /** best rank and best score in any season's leaderboard, the live one included */
    bestRank: number | null;
    bestScore: number | null;
    /** their rank in every season they ranked in, best first: what breaks a tie on the best */
    ranks: number[];
}

/** GET /clans */
export interface ClansList extends BaseApiResponse {
    clans: ClanSummary[];
}

/** GET /clans/:id */
export interface ClanData extends BaseApiResponse {
    clan: Clan;
    /** best live rank first */
    members: ClanMember[];
    /** the live season the ranks come from */
    seasonId: number | null;
    seasonName: string | null;
}

/** A clan as a side of a comparison: `name` null when the server has no reading of it. */
export interface ClanSideInfo {
    id: string;
    name: string | null;
    bannerURL: string | null;
}

/** A member picked out of the clan's games (most active, best), with their record. */
export interface ClanPlayerPick {
    userId: string;
    name: string | null;
    alias: string | null;
    tag: PlayerTag | null;
    record: Wld;
}

/**
 * The known members' games added up: this season from the recorded matches, all time from
 * Ninja Kiwi's lifetime numbers (the rival clans always from the recorded matches).
 */
export interface ClanTotals {
    record: Wld;
    lastGame: string | null;
    /** members with a game */
    players: number;
    mostActive: ClanPlayerPick | null;
    /** by win rate, shrunk toward the clan's when they played little */
    best: ClanPlayerPick | null;
    rivals: {
        /** the clan they met the most */
        mostPlayed: ClanRival | null;
        /** the clan that beats them the most surely (none: never lost to one) */
        toughest: ClanRival | null;
    };
}

/** Another clan, with the record against it. */
export interface ClanRival {
    clan: { id: string; name: string };
    record: Wld;
}

/** The clan's record against another clan (by id). */
export interface ClanH2hRecord {
    id: string;
    record: Wld;
    lastMet: string | null;
}

/** GET /clans/:id/overview */
export interface ClanOverview extends BaseApiResponse {
    /** the live season, or the last one they have a game in when they didn't play it yet */
    season: (ClanTotals & { seasonId: number; name: string; live: boolean }) | null;
    /** the season "this season" stands for in the head to head and the members */
    liveSeason: { seasonId: number; name: string } | null;
    /** Ninja Kiwi's lifetime numbers (the rival clans: from the recorded matches) */
    allTime: ClanTotals;
    /** newest first, the seasons with a game */
    seasons: SeasonRecord[];
    /**
     * `top`: the top clans (this season's win rate, weighted by games), the head to head
     * card's default opponents; then the record against every clan met, most games first,
     * this season and in every season
     */
    headToHead: { top: ClanSummary[]; season: ClanH2hRecord[]; all: ClanH2hRecord[] };
    /** each member with a game: their record this season and in every season */
    members: { userId: string; season: Wld; all: Wld; lastGame: string | null }[];
}

/** /clan/<id> URL search */
export interface ClanSearch {
    /** recent matches shown */
    matches?: number | undefined;
    /** seasons shown */
    seasons?: number | undefined;
}
