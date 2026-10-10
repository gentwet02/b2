import type { Match, MatchPick, Outcome } from '@/types/match';
import { mapImage } from '@/utils/assetOverrides';
import { extractUserId, formatDuration, formatLabel, formatMap, timeAgo } from '@/utils/format';
import Pickable from './Pickable';
import PlayerSide from './PlayerSide';

interface MatchCardProps {
    match: Match;
    /** Profile being viewed: its side goes left and the card edge shows its result. */
    perspectiveId?: string | undefined;
    /** When set, hero, towers and map become buttons that filter on them. */
    onPick?: ((pick: MatchPick) => void) | undefined;
}

function outcome(result: string): Outcome {
    if (result === 'win' || result === 'opponentLobbyDC') return 'win';
    if (result === 'lose' || result === 'lobbyDC') return 'lose';
    return 'neutral';
}

/** What the middle of the card says when nobody won. */
const NEUTRAL_TEXT: Record<string, string> = {
    draw: 'Draw',
    cancelled: 'Cancelled',
};

export default function MatchCard({ match, perspectiveId, onPick }: MatchCardProps) {
    let [left, right] = [match.playerLeft, match.playerRight];
    if (perspectiveId && extractUserId(right.profileURL) === perspectiveId) {
        [left, right] = [right, left];
    }
    const tone = perspectiveId ? outcome(left.result) : 'neutral';
    const nobodyWon = outcome(left.result) === 'neutral' && outcome(right.result) === 'neutral';
    const middle = nobodyWon ? (NEUTRAL_TEXT[left.result] ?? formatLabel(left.result)) : 'vs';
    const seen = timeAgo(match.seenAt);
    const mapSrc = mapImage(match.map, match.mapURL);

    return (
        <article className={`match-card match-card--${tone}`}>
            <PlayerSide player={left} align='left' outcome={outcome(left.result)} onPick={onPick} />
            <div className='match-card__center'>
                {mapSrc && (
                    <img
                        className='match-card__map-img'
                        src={mapSrc}
                        alt=''
                        loading='lazy'
                        width={160}
                        height={90}
                    />
                )}
                <Pickable
                    className='match-card__map-name'
                    pick={{ kind: 'map', value: match.map }}
                    onPick={onPick}
                >
                    {formatMap(match.map)}
                </Pickable>
                <span className='match-card__meta'>
                    Round {match.endRound}, {formatDuration(match.duration)}
                </span>
                {seen && match.seenAt && (
                    <time
                        className='match-card__meta'
                        dateTime={match.seenAt}
                        title={`First seen ${new Date(match.seenAt).toLocaleString()}. Ninja Kiwi doesn't publish when a match was played.`}
                    >
                        Seen {seen}
                    </time>
                )}
                {nobodyWon && <span className='match-card__outcome'>{middle}</span>}
            </div>
            <PlayerSide
                player={right}
                align='right'
                outcome={outcome(right.result)}
                onPick={onPick}
            />
        </article>
    );
}
