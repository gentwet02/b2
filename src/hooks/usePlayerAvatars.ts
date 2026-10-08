import type { UserProfileData } from '@/types/profile';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Avatars for the leaderboard: the server's known avatars, overridden by any profile
 * already loaded in this tab (fresher, and covers players the server has no copy of).
 * Read at render, so coming back from a profile shows its avatar right away.
 */
export default function usePlayerAvatars(serverAvatars: Record<string, string> | undefined) {
    const queryClient = useQueryClient();
    const avatars: Record<string, string> = { ...serverAvatars };
    for (const [key, data] of queryClient.getQueriesData<UserProfileData>({
        queryKey: ['userProfile'],
    })) {
        const id = key[1];
        const url = data?.body?.equippedAvatarURL;
        if (typeof id === 'string' && url) avatars[id] = url;
    }
    return avatars;
}
