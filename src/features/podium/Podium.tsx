import { Link } from '@tanstack/react-router';
import PlayerAvatar from '@/components/avatar/PlayerAvatar';
import type { RankedPlayer } from '@/features/leaderboard/LeaderboardScore';
import usePlayerAvatars from '@/hooks/usePlayerAvatars';
import { formatNumber, getAlias } from '@/utils/format';
import PodiumStats from './PodiumStats';

const ORDER = [2, 1, 3];

interface PodiumProps {
    players: RankedPlayer[];
    avatars?: Record<string, string> | undefined;
    /** [wins, losses, draws] per player id, from the leaderboard stats */
    records?: Record<string, [number, number, number]> | undefined;
}

export default function Podium(props: PodiumProps) {
    const { players, avatars: serverAvatars, records } = props;

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
                                    name={player.name}
                                    size={72}
                                />
                                <span className='podium__name'>{player.name}</span>
                                <span className='podium__alias'>{getAlias(player)}</span>
                                <span className='podium__score'>{formatNumber(player.score)}</span>
                            </Link>
                            <div className='podium__step'>
                                <span aria-hidden='true'>{player.rank}</span>
                                <PodiumStats record={records?.[player.id]} />
                            </div>
                            <span className='visually-hidden'>Rank {player.rank}</span>
                        </li>
                    ),
            )}
        </ol>
    );
}
