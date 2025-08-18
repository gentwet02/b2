import UserProfile from '@/features/UserProfile';
import { getRouteApi } from '@tanstack/react-router';

const routeApi = getRouteApi('/user/$userId');

export default function User() {
    const { userId } = routeApi.useParams();

    return (
        <main className='user'>
            <UserProfile userId={userId} />
        </main>
    );
}
