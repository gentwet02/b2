import { formatNumber } from '@/utils/format';
import { Link } from '@tanstack/react-router';
import type { RankedPlayer } from './LeaderboardScore';

const ORDER = [2, 1, 3];

export default function Podium({
    players,
    avatars = {},
}: {
    players: RankedPlayer[];
    avatars?: Record<string, string>;
}) {
    const top = ORDER.map((rank) => players[rank - 1]).filter(Boolean);
    if (top.length === 0) return null;

    return (
        <ol className='podium' aria-label='Top three players'>
            {top.map(
                (player) =>
                    player && (
                        <li key={player.id} className={`podium__spot podium__spot--${player.rank}`}>
                            <Link
                                to='/user/$userId'
                                params={{ userId: player.id }}
                                className='podium__player'
                            >
                                {avatars[player.id] ? (
                                    <img
                                        className='podium__avatar'
                                        src={avatars[player.id]}
                                        alt=''
                                        width={72}
                                        height={72}
                                    />
                                ) : (
                                    <span
                                        className='podium__avatar podium__avatar--empty'
                                        aria-hidden='true'
                                    >
                                        {(player.realName || player.name).charAt(0).toUpperCase()}
                                    </span>
                                )}
                                <span className='podium__name'>
                                    {player.realName || player.name}
                                </span>
                                <span className='podium__score'>{formatNumber(player.score)}</span>
                            </Link>
                            <div className='podium__step' aria-hidden='true'>
                                {player.rank}
                            </div>
                            <span className='visually-hidden'>Rank {player.rank}</span>
                        </li>
                    ),
            )}
        </ol>
    );
}
