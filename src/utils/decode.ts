import type { LeaderboardPlayer, LeaderboardPlayerEncoded } from '@/types/leaderboard';

export function decodeLeaderboardPlayer(player: LeaderboardPlayerEncoded): LeaderboardPlayer {
    return {
        id: player.i,
        ...(player.r && { alias: player.r }),
        name: player.n,
        currentlyInHoM: player.d[0] === '1',
        score: Number(player.d.slice(1)),
    };
}
