import PlayerAvatar from '@/components/avatar/PlayerAvatar';
import usePlayerAvatar from '@/hooks/queries/usePlayerAvatar';

interface UserAvatarProps {
    id: string;
    /** for the fallback letter */
    name: string;
    size?: number;
}

/** A player's avatar, loaded from their id. */
export default function UserAvatar(props: UserAvatarProps) {
    const { id, name, size = 32 } = props;

    const src = usePlayerAvatar(id);
    return (
        <span className='user-avatar' style={{ width: size, height: size, fontSize: size * 0.45 }}>
            <PlayerAvatar className='user-avatar__img' src={src} name={name} size={size} lazy />
        </span>
    );
}
