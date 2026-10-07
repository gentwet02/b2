import type { Match, MatchPlayer } from '@/types/match';
import {
    extractUserId,
    formatDuration,
    formatHero,
    formatLabel,
    formatMap,
    timeAgo,
} from '@/utils/format';
import { Link } from '@tanstack/react-router';

export type MatchPick = { kind: 'hero' | 'tower' | 'map'; value: string };

interface MatchCardProps {
    match: Match;
    /** Profile being viewed: its side goes left and the card edge shows its result. */
    perspectiveId?: string;
    /** When set, hero, towers and map become buttons that filter on them. */
    onPick?: (pick: MatchPick) => void;
}

type Outcome = 'win' | 'lose' | 'neutral';

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

const RESULT_TEXT: Record<string, string> = {
    win: 'Won',
    lose: 'Lost',
    draw: 'Draw',
    cancelled: 'Cancelled',
    lobbyDC: 'Left lobby',
    opponentLobbyDC: 'Opponent left',
};

function Pickable({
    pick,
    onPick,
    className,
    children,
}: {
    pick: MatchPick;
    onPick?: (pick: MatchPick) => void;
    className: string;
    children: string;
}) {
    if (!onPick) return <span className={className}>{children}</span>;
    return (
        <button
            type='button'
            className={`${className} match-card__pick`}
            onClick={() => onPick(pick)}
            title={`Filter on ${children}`}
        >
            {children}
        </button>
    );
}

function PlayerSide({
    player,
    align,
    onPick,
}: {
    player: MatchPlayer;
    align: 'left' | 'right';
    onPick?: (pick: MatchPick) => void;
}) {
    const userId = extractUserId(player.profileURL);
    const towers = [player.towerone, player.towertwo, player.towerthree];
    const state = outcome(player.result);
    const alias =
        player.realName && player.realName !== player.displayName ? player.displayName : null;

    return (
        <div className={`match-card__side match-card__side--${align} match-card__side--${state}`}>
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
                        {player.realName || player.displayName}
                    </Link>
                    {state === 'win' ? (
                        <span className='match-card__result match-card__result--win'>
                            <span aria-hidden='true'>★ </span>
                            {player.result === 'win' ? 'Winner' : RESULT_TEXT[player.result]}
                        </span>
                    ) : (
                        state === 'lose' && (
                            <span className='match-card__result match-card__result--lose'>
                                {RESULT_TEXT[player.result] ?? formatLabel(player.result)}
                            </span>
                        )
                    )}
                </div>
                {alias && <div className='match-card__alias'>{alias}</div>}
                <div>
                    <Pickable
                        className='match-card__hero'
                        pick={{ kind: 'hero', value: player.hero }}
                        onPick={onPick}
                    >
                        {formatHero(player.hero)}
                    </Pickable>
                </div>
                <ul className='match-card__towers' aria-label='Towers'>
                    {towers.map((tower, i) => (
                        <li key={`${tower}-${i}`}>
                            <Pickable
                                className='match-card__tower'
                                pick={{ kind: 'tower', value: tower }}
                                onPick={onPick}
                            >
                                {formatLabel(tower)}
                            </Pickable>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default function MatchCard({ match, perspectiveId, onPick }: MatchCardProps) {
    let [left, right] = [match.playerLeft, match.playerRight];
    if (perspectiveId && extractUserId(right.profileURL) === perspectiveId) {
        [left, right] = [right, left];
    }
    const tone = perspectiveId ? outcome(left.result) : 'neutral';
    const nobodyWon = outcome(left.result) === 'neutral' && outcome(right.result) === 'neutral';
    const middle = nobodyWon ? (NEUTRAL_TEXT[left.result] ?? formatLabel(left.result)) : 'vs';
    const seen = timeAgo(match.seenAt);

    return (
        <article className={`match-card match-card--${tone}`}>
            <PlayerSide player={left} align='left' onPick={onPick} />
            <div className='match-card__center'>
                {match.mapURL && (
                    <img
                        className='match-card__map-img'
                        src={match.mapURL}
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
            <PlayerSide player={right} align='right' onPick={onPick} />
        </article>
    );
}
