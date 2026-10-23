import { NEUTRAL_TEXT } from '@/config/match';
import type { Match, MatchPick } from '@/types/match';
import { mapImage } from '@/utils/assetOverrides';
import { formatDuration, formatLabel, timeAgo } from '@/utils/format';
import { formatMap } from '@/utils/map';
import { matchOutcome } from '@/utils/match';
import { extractUserId } from '@/utils/player';
import { seasonLabel } from '@/utils/season';
import Pickable from './Pickable';
import PlayerSide from './PlayerSide';

interface MatchCardProps {
    match: Match;
    /** Profile being viewed: its side goes left and the card edge shows its result. */
    perspectiveId?: string | undefined;
    /** When set, hero, towers and map become buttons that filter on them. */
    onPick?: ((pick: MatchPick) => void) | undefined;
    /** say which season the match was recorded in */
    showSeason?: boolean | undefined;
}

export default function MatchCard(props: MatchCardProps) {
    const { match, perspectiveId, onPick, showSeason } = props;

    let [left, right] = [match.playerLeft, match.playerRight];
    if (perspectiveId && extractUserId(right.profileURL) === perspectiveId) {
        [left, right] = [right, left];
    }
    const leftOutcome = matchOutcome(left.result);
    const rightOutcome = matchOutcome(right.result);
    const tone = perspectiveId ? leftOutcome : 'neutral';
    const nobodyWon = leftOutcome === 'neutral' && rightOutcome === 'neutral';
    const middle = nobodyWon ? (NEUTRAL_TEXT[left.result] ?? formatLabel(left.result)) : 'vs';
    const seen = timeAgo(match.seenAt);
    const mapSrc = mapImage(match.map, match.mapURL);

    return (
        <article className={`match-card match-card--${tone}`}>
            <PlayerSide player={left} align='left' outcome={leftOutcome} onPick={onPick} />
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
                <div className='match-card__info'>
                    <Pickable
                        className='match-card__map-name'
                        pick={{ kind: 'map', value: match.map }}
                        onPick={onPick}
                    >
                        {formatMap(match.map)}
                    </Pickable>
                    <div className='match-card__details'>
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
                        {showSeason && match.seasonId !== undefined && (
                            <span className='match-card__meta match-card__season'>
                                {seasonLabel(match.seasonId)}
                            </span>
                        )}
                    </div>
                    {nobodyWon && <span className='match-card__outcome'>{middle}</span>}
                </div>
            </div>
            <PlayerSide player={right} align='right' outcome={rightOutcome} onPick={onPick} />
        </article>
    );
}
