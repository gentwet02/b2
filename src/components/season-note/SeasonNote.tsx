import useSeasons from '@/hooks/queries/useSeasons';
import type { SeasonScope } from '@/types/season';
import {
    incompleteSeasonsText,
    isIncompleteSeason,
    isUnfilteredSeason,
    seasonLabel,
    unfilteredSeasonsText,
} from '@/utils/season';
import './SeasonNote.scss';

interface SeasonNoteProps {
    /** undefined: the live season */
    season: SeasonScope | undefined;
    /** the oldest season recorded, when the page already knows it */
    firstSeasonId?: number | null | undefined;
    className?: string;
}

/**
 * Under a season pick: "all seasons" only reaches back to the first season recorded,
 * a few seasons are missing some matches (marked with an asterisk), and in a few others
 * NK's history let some non-Hall of Masters games through.
 */
export default function SeasonNote(props: SeasonNoteProps) {
    const { season, className } = props;
    const seasons = useSeasons();

    const current = season ?? seasons.data?.liveSeason;
    const classes = ['season-note', className].filter(Boolean).join(' ');

    if (current === 'all') {
        const first = props.firstSeasonId ?? seasons.data?.firstRecordedSeason;
        return (
            <p className={classes}>
                <span className='season-note__line'>
                    {typeof first === 'number'
                        ? `All seasons: since ${seasonLabel(first)}, the first one recorded in the database.`
                        : 'All seasons: only the seasons recorded in the database.'}
                </span>
                <span className='season-note__line'>
                    <span className='season-note__mark'>*</span>
                    {incompleteSeasonsText()} are missing some matches.
                </span>
                <span className='season-note__line'>
                    {unfilteredSeasonsText()} include some games played outside Hall of Masters.
                </span>
            </p>
        );
    }

    if (typeof current !== 'number') return null;
    const incomplete = isIncompleteSeason(current);
    const unfiltered = isUnfilteredSeason(current);
    if (!incomplete && !unfiltered) return null;

    return (
        <p className={classes}>
            {incomplete && (
                <span className='season-note__line'>
                    <span className='season-note__mark'>*</span>
                    {seasonLabel(current)} is missing some matches.
                </span>
            )}
            {unfiltered && (
                <span className='season-note__line'>
                    <span className='season-note__mark'>*</span>
                    {seasonLabel(current)} includes some games played outside Hall of Masters.
                </span>
            )}
        </p>
    );
}
