import { INCOMPLETE_SEASON_NUMBERS } from '@/config/seasons';
import type { MatchesPage } from '@/types/match';
import type { SeasonScope, SeasonSummary } from '@/types/season';

export const seasonLabel = (seasonId: number) => `Season ${seasonId + 1}`;

/** Some of this season's matches are missing. */
export const isIncompleteSeason = (seasonId: number) =>
    INCOMPLETE_SEASON_NUMBERS.includes(seasonId + 1);

/** "*" after the seasons with missing data. */
export const incompleteMark = (seasonId: number) => (isIncompleteSeason(seasonId) ? '*' : '');

/** "Seasons 20, 21, 24, 29 and 31" */
export const incompleteSeasonsText = () => {
    const n = INCOMPLETE_SEASON_NUMBERS;
    const list = n.length > 1 ? `${n.slice(0, -1).join(', ')} and ${n[n.length - 1]}` : `${n[0]}`;
    return `${n.length > 1 ? 'Seasons' : 'Season'} ${list}`;
};

export const allSeasonsLabel = (
    seasonId: SeasonScope | undefined,
    page: MatchesPage | undefined,
) => {
    if (seasonId === 'all') {
        const first = page?.firstSeasonId;
        return `all seasons${first ? ` (since ${seasonLabel(first)})` : ''}`;
    } else {
        return typeof seasonId === 'number' ? seasonLabel(seasonId) : 'this season';
    }
};

/** NK's season name without its "Event" suffix: "Season 31 Event" → "Season 31". */
export const seasonTitle = (name: string) => name.replace(/\s*\bevent\b/gi, '').trim();

/** "in Season 47" / "in any season", for sentences about the games counted. */
export const inScope = (d: { season: SeasonScope; seasonName: string }) =>
    d.season === 'all' ? 'in any season' : `in ${seasonTitle(d.seasonName)}`;

/** The season to put in the URL: none for the live one (the default). */
export const urlSeason = <S extends SeasonScope>(season: S, liveSeason: number | undefined) =>
    season === liveSeason ? undefined : season;

/** Dropdown options: "Season 48 (live)", newest last, like the server sends them;
 *  `markIncomplete`: "Season 20*" for the seasons with missing data. */
export const seasonOptions = (seasons: SeasonSummary[], markIncomplete = false) =>
    seasons.map((s) => ({
        value: s.id,
        label: `${seasonLabel(s.id)}${markIncomplete ? incompleteMark(s.id) : ''}${s.live ? ' (live)' : ''}`,
    }));
