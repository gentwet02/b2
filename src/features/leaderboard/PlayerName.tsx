import { Link } from '@tanstack/react-router';
import PlayerAvatar from '@/components/avatar/PlayerAvatar';
import usePlayerAvatar from '@/hooks/usePlayerAvatar';
import type { LeaderboardPlayer } from '@/types/leaderboard';
import { getAlias } from '@/utils/format';

interface PlayerNameProps {
    player: LeaderboardPlayer;
    avatar?: string | undefined;
    avatarReady?: boolean;
}
export function PlayerName(props: PlayerNameProps) {
    const { player, avatar, avatarReady = true } = props;

    const src = usePlayerAvatar(player.id, avatar, avatarReady);
    const alias = getAlias(player);

    return (
        <span className='lb-player'>
            <PlayerAvatar
                className='lb-player__avatar'
                src={src}
                name={player.name}
                size={36}
                lazy
            />
            <span className='lb-player__names'>
                <Link to='/user/$userId' params={{ userId: player.id }} className='lb-player__name'>
                    {player.name}
                </Link>
                {alias && <span className='lb-player__alias'>{alias}</span>}
            </span>
        </span>
    );
}
