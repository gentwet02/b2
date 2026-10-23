import type { Match, MatchPick } from '@/types/match';
import MatchCard from './MatchCard';

interface MatchListProps {
    matches: Match[];
    /** the profile being viewed: its side of each card goes left */
    perspectiveId?: string | undefined;
    /** hero, towers and map become buttons that filter on them */
    onPick?: ((pick: MatchPick) => void) | undefined;
    className?: string;
    /** say which season each match was recorded in (lists spanning several seasons) */
    showSeason?: boolean;
}

export default function MatchList(props: MatchListProps) {
    const { matches, perspectiveId, onPick, className, showSeason } = props;

    return (
        <ul className={className ? `match-list ${className}` : 'match-list'}>
            {matches.map((match) => (
                <li key={`${match.seasonId ?? ''}:${match.id}`}>
                    <MatchCard
                        match={match}
                        perspectiveId={perspectiveId}
                        onPick={onPick}
                        showSeason={showSeason}
                    />
                </li>
            ))}
        </ul>
    );
}
