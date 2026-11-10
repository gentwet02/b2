import { Link } from '@tanstack/react-router';
import UserAvatar from '@/components/avatar/UserAvatar';
import type { Comparison, CompareSideKey } from '@/types/compare';
import { sideName } from '@/utils/compareTitles';

interface SideTitleProps {
    data: Comparison;
    side: CompareSideKey;
}

/**
 * One side in the title: a player (avatar, link to the profile), a clan (link to its page)
 * or the range.
 */
export default function SideTitle(props: SideTitleProps) {
    const { data, side } = props;
    const name = sideName(data, side);
    const id = data[side].userId;
    if (data[side].mode === 'anyone') return <span>anyone</span>;
    const clan = data[side].clan;
    if (clan) {
        return (
            <Link to='/clan/$clanId' params={{ clanId: clan.id }}>
                {name}
            </Link>
        );
    }
    if (!id) return <span>{name}</span>;
    return (
        <>
            <UserAvatar id={id} name={name} size={40} />
            <Link to='/user/$userId' params={{ userId: id }}>
                {name}
            </Link>
        </>
    );
}
