import { Link } from '@tanstack/react-router';
import UserAvatar from '@/components/avatar/UserAvatar';
import type { Comparison, CompareSideKey } from '@/types/compare';
import { sideName } from '@/utils/compareTitles';

interface SideTitleProps {
    data: Comparison;
    side: CompareSideKey;
}

/** One side in the title: a player (avatar, link to the profile) or the range. */
export default function SideTitle(props: SideTitleProps) {
    const { data, side } = props;
    const name = sideName(data, side);
    const id = data[side].userId;
    if (data[side].mode === 'anyone') return <span>anyone</span>;
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
