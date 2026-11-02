import { useMemo } from 'react';
import { queryKeys } from '@/hooks/queries/keys';
import useCachedQueriesData from '@/hooks/useCachedQueriesData';
import type { UserProfileData } from '@/types/profile';

/**
 * Avatars for the leaderboard: the server's known avatars, overridden by any profile
 * loaded in this tab (fresher, and covers players the server has no copy of). Follows the
 * cache, so a profile loading (a hover's prefetch too) shows its avatar right away.
 */
export default function usePlayerAvatars(serverAvatars: Record<string, string> | undefined) {
    const profiles = useCachedQueriesData<UserProfileData>(queryKeys.profile());
    return useMemo(() => {
        const avatars: Record<string, string> = { ...serverAvatars };
        for (const [key, data] of profiles) {
            const id = key[1];
            const url = data?.body?.equippedAvatarURL;
            if (typeof id === 'string' && url) avatars[id] = url;
        }
        return avatars;
    }, [serverAvatars, profiles]);
}
