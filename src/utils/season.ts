import { INCOMPLETE_SEASON_NUMBERS, UNFILTERED_SEASON_NUMBERS } from '@/config/seasons';
import type { InfoResponse } from '@/types/info';
import type { MatchesPage } from '@/types/match';
import type { SeasonQuery, SeasonScope, SeasonSummary } from '@/types/season';

export const seasonLabel = (seasonId: number) => `Season ${seasonId + 1}`;

/** Some of this season's matches are missing. */
export const isIncompleteSeason = (seasonId: number) =>
    INCOMPLETE_SEASON_NUMBERS.includes(seasonId + 1);

/** Some of this season's matches weren't played in Hall of Masters. */
export const isUnfilteredSeason = (seasonId: number) =>
    UNFILTERED_SEASON_NUMBERS.includes(seasonId + 1);

/** "Seasons 17–21, 24 and 40–43": runs of three or more seasons shortened to a range. */
function seasonsText(numbers: readonly number[]) {
    const parts: string[] = [];
    for (let i = 0; i < numbers.length; ) {
        let j = i;
        while (j + 1 < numbers.length && numbers[j + 1] === numbers[j]! + 1) j++;
        if (j - i >= 2) {
            parts.push(`${numbers[i]}–${numbers[j]}`);
        } else {
            parts.push(...numbers.slice(i, j + 1).map(String));
        }
        i = j + 1;
    }
    const list =
        parts.length > 1 ? `${parts.slice(0, -1).join(', ')} and ${parts.at(-1)}` : parts[0];
    return `${numbers.length > 1 ? 'Seasons' : 'Season'} ${list}`;
}

/** "Seasons 20, 21, 24, 29 and 31" */
export const incompleteSeasonsText = () => seasonsText(INCOMPLETE_SEASON_NUMBERS);

/** "Seasons 17–21 and 40–43" */
export const unfilteredSeasonsText = () => seasonsText(UNFILTERED_SEASON_NUMBERS);

export function allSeasonsLabel(seasonId: SeasonScope | undefined, page: MatchesPage | undefined) {
    if (seasonId === 'all') {
        const first = page?.firstSeasonId;
        return `all seasons${first ? ` (since ${seasonLabel(first)})` : ''}`;
    } else {
        return typeof seasonId === 'number' ? seasonLabel(seasonId) : 'this season';
    }
}

/** NK's season name without its "Event" suffix: "Season 31 Event" → "Season 31". */
export const seasonTitle = (name: string) => name.replace(/\s*\bevent\b/gi, '').trim();

/** "in Season 47" / "in any season", for sentences about the games counted. */
export function inScope(d: { season: SeasonScope; seasonName: string }) {
    return d.season === 'all' && d.seasonName === 'All seasons'
        ? 'in any season'
        : `in ${seasonTitle(d.seasonName)}`;
}

/** The season to put in the URL: none for the live one (the default). */
export const urlSeason = <S extends SeasonScope>(season: S, liveSeason: number | undefined) =>
    season === liveSeason ? undefined : season;

/** Dropdown options: "Season 48 (live)", newest last. */
export function seasonOptions(seasons: SeasonSummary[]) {
    return seasons.map((s) => ({
        value: s.id,
        label: `${seasonLabel(s.id)}${s.live ? ' (live)' : ''}`,
    }));
}

/**
 * The season ids a query counts, newest first: the live one without a query, and for "all"
 * the seasons since the first one with recorded games.
 */
export function seasonIdsOf(query: SeasonQuery | undefined, info: InfoResponse | undefined) {
    if (!info) return [];
    const live = info.liveSeason;
    if (query === undefined) return [live];
    if (typeof query === 'number') return [query];
    const known = new Set((info.seasons ?? []).map((s) => s.id));
    let from: number;
    let to = live;
    if (query === 'all') {
        from = info.firstRecordedSeason ?? (known.size ? Math.min(...known) : live);
    } else {
        const [a, b] = query.split('-').map(Number) as [number, number];
        from = Math.min(a, b);
        to = Math.min(Math.max(a, b), live);
    }
    const ids: number[] = [];
    for (let id = to; id >= from; id--) {
        if (!known.size || known.has(id)) ids.push(id);
    }
    return ids;
}
