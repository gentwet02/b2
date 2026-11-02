import { getRouteApi } from '@tanstack/react-router';
import Page from '@/components/page/Page';
import UserProfile from '@/features/profile/UserProfile';

const routeApi = getRouteApi('/user/$userId');

export default function User() {
    const { userId } = routeApi.useParams();

    return (
        <Page className='user'>
            {/* keyed: another profile starts fresh (open rows, pages shown) */}
            <UserProfile key={userId} userId={userId} />
        </Page>
    );
}
