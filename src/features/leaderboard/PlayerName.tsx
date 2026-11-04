import { Link } from '@tanstack/react-router';
import PlayerAvatar from '@/components/avatar/PlayerAvatar';
import FoundAs from '@/components/text/FoundAs';
import usePlayerAvatar from '@/hooks/queries/usePlayerAvatar';
import type { LeaderboardPlayer } from '@/types/leaderboard';
import { getAlias, matchedKeyword, nameKeywords } from '@/utils/player';

interface PlayerNameProps {
    player: LeaderboardPlayer;
    avatar?: string | undefined;
    avatarReady?: boolean;
    /** the table's search: notes the other name the player was found by */
    searchTerm?: string | undefined;
    /** the search also matches old names */
    withOldNames?: boolean | undefined;
}

/** Avatar, name (a link to the profile) and alias, in a leaderboard row. */
export default function PlayerName(props: PlayerNameProps) {
    const { player, avatar, avatarReady = true, searchTerm, withOldNames = true } = props;

    const src = usePlayerAvatar(player.id, avatar, avatarReady);
    const alias = getAlias(player);
    const matched = matchedKeyword(
        `${player.name} ${alias ?? ''}`,
        nameKeywords(player, withOldNames),
        searchTerm,
    );

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
                {matched && <FoundAs found={matched} />}
            </span>
        </span>
    );
}
