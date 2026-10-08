import PlayerAvatar from '@/components/avatar/PlayerAvatar';
import usePlayerAvatars from '@/hooks/usePlayerAvatars';
import { formatNumber } from '@/utils/format';
import { Link } from '@tanstack/react-router';
import type { RankedPlayer } from './LeaderboardScore';

const ORDER = [2, 1, 3];

export default function Podium({
    players,
    avatars: serverAvatars,
}: {
    players: RankedPlayer[];
    avatars?: Record<string, string>;
}) {
    const avatars = usePlayerAvatars(serverAvatars);
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
                                <PlayerAvatar
                                    className='podium__avatar'
                                    src={avatars[player.id]}
                                    name={player.realName || player.name}
                                    size={72}
                                />
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
