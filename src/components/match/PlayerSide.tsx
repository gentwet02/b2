import type { MatchPick, MatchPlayer, Outcome } from '@/types/match';
import { extractUserId, formatHero, formatLabel } from '@/utils/format';
import Pickable from './Pickable';
import { Link } from '@tanstack/react-router';
import { heroImage } from '@/utils/assetOverrides';

const RESULT_TEXT: Record<string, string> = {
    win: 'Won',
    lose: 'Lost',
    draw: 'Draw',
    cancelled: 'Cancelled',
    lobbyDC: 'Left lobby',
    opponentLobbyDC: 'Opponent left',
};

export default function PlayerSide({
    player,
    align,
    outcome,
    onPick,
}: {
    player: MatchPlayer;
    align: 'left' | 'right';
    outcome: Outcome;
    onPick?: ((pick: MatchPick) => void) | undefined;
}) {
    const userId = extractUserId(player.profileURL);
    const towers = [player.towerone, player.towertwo, player.towerthree];
    const alias =
        player.realName && player.realName !== player.displayName ? player.displayName : null;
    const portrait = heroImage(player.hero, player.heroPortrait);

    return (
        <div className={`match-card__side match-card__side--${align} match-card__side--${outcome}`}>
            {portrait ? (
                <img
                    className='match-card__hero-img'
                    src={portrait}
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
                    {outcome === 'win' ? (
                        <span className='match-card__result match-card__result--win'>
                            <span aria-hidden='true'>★ </span>
                            {player.result === 'win' ? 'Winner' : RESULT_TEXT[player.result]}
                        </span>
                    ) : (
                        outcome === 'lose' && (
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
