import type { UserProfileData } from '@/types/profile';
import { useQuery } from '@tanstack/react-query';

export default function useProfile(userId: string) {
    return useQuery<UserProfileData>({
        queryKey: ['userProfile', userId],
        queryFn: async () => {
            const response = await fetch(`https://data.ninjakiwi.com/battles2/users/${userId}`);
            if (!response.ok) throw new Error('Failed to fetch user profile');
            return response.json();
        },
        enabled: !!userId,
    });
}
