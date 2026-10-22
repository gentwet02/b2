import type { SeasonScope, SeasonSummary } from '@/types/season';

export const seasonLabel = (seasonId: number) => `Season ${seasonId + 1}`;

/** NK's season name without its "Event" suffix: "Season 31 Event" → "Season 31". */
export const seasonTitle = (name: string) => name.replace(/\s*\bevent\b/gi, '').trim();

/** "in Season 47" / "in any season", for sentences about the games counted. */
export const inScope = (d: { season: SeasonScope; seasonName: string }) =>
    d.season === 'all' ? 'in any season' : `in ${seasonTitle(d.seasonName)}`;

/** The season to put in the URL: none for the live one (the default). */
export const urlSeason = <S extends SeasonScope>(season: S, liveSeason: number | undefined) =>
    season === liveSeason ? undefined : season;

/** Dropdown options: "Season 48 (live)", newest last, like the server sends them. */
export const seasonOptions = (seasons: SeasonSummary[]) =>
    seasons.map((s) => ({ value: s.id, label: `${seasonLabel(s.id)}${s.live ? ' (live)' : ''}` }));
