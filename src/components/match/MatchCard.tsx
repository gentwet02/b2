import type { Match, MatchPlayer } from '@/types/match';
import { extractUserId, formatDuration, formatHero, formatLabel, formatMap } from '@/utils/format';
import { Link } from '@tanstack/react-router';

interface MatchCardProps {
    match: Match;
    /** Profile being viewed: its side goes left and the card shows its result. */
    perspectiveId?: string;
}

const RESULT_TEXT: Record<string, string> = {
    win: 'Won',
    lose: 'Lost',
    draw: 'Draw',
    cancelled: 'Cancelled',
    lobbyDC: 'Left lobby',
    opponentLobbyDC: 'Opponent left',
};

function outcome(result: string): 'win' | 'lose' | 'neutral' {
    if (result === 'win' || result === 'opponentLobbyDC') return 'win';
    if (result === 'lose' || result === 'lobbyDC') return 'lose';
    return 'neutral';
}

function PlayerSide({ player, align }: { player: MatchPlayer; align: 'left' | 'right' }) {
    const userId = extractUserId(player.profileURL);
    const towers = [player.towerone, player.towertwo, player.towerthree];
    const state = outcome(player.result);

    return (
        <div className={`match-card__side match-card__side--${align}`}>
            {player.heroPortrait ? (
                <img
                    className='match-card__hero-img'
                    src={player.heroPortrait}
                    alt=''
                    loading='lazy'
                    width={44}
                    height={44}
                />
            ) : (
                <span className='match-card__hero-img match-card__hero-img--empty' aria-hidden />
            )}
            <div className='match-card__player'>
                <div className='match-card__name-row'>
                    <Link
                        to='/user/$userId'
                        params={{ userId }}
                        className='match-card__name'
                        title={`Open ${player.displayName}'s profile`}
                    >
                        {player.displayName}
                    </Link>
                    <span className={`match-card__result match-card__result--${state}`}>
                        {RESULT_TEXT[player.result] ?? formatLabel(player.result)}
                    </span>
                </div>
                <div className='match-card__hero'>{formatHero(player.hero)}</div>
                <ul className='match-card__towers' aria-label='Towers'>
                    {towers.map((tower, i) => (
                        <li key={`${tower}-${i}`} className='match-card__tower'>
                            {formatLabel(tower)}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default function MatchCard({ match, perspectiveId }: MatchCardProps) {
    let [left, right] = [match.playerLeft, match.playerRight];
    if (perspectiveId && extractUserId(right.profileURL) === perspectiveId) {
        [left, right] = [right, left];
    }
    const tone = perspectiveId ? outcome(left.result) : 'neutral';

    return (
        <article className={`match-card match-card--${tone}`}>
            <div className='match-card__map'>
                {match.mapURL && (
                    <img
                        className='match-card__map-img'
                        src={match.mapURL}
                        alt=''
                        loading='lazy'
                        width={96}
                        height={64}
                    />
                )}
                <div className='match-card__map-info'>
                    <span className='match-card__map-name'>{formatMap(match.map)}</span>
                    <span className='match-card__meta'>
                        Round {match.endRound}, {formatDuration(match.duration)}
                    </span>
                </div>
            </div>
            <div className='match-card__players'>
                <PlayerSide player={left} align='left' />
                <span className='match-card__vs' aria-label='versus'>
                    vs
                </span>
                <PlayerSide player={right} align='right' />
            </div>
        </article>
    );
}
