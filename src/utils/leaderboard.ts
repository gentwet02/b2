import type { LeaderboardLine, LeaderboardPlayer, LeaderboardView } from '@/types/leaderboard';

const displayName = (p: LeaderboardPlayer) => p.alias || p.name;

/** `dir` -1: the sort's opposite order (players without a win rate stay last). */
export function compareLines(
    sort: LeaderboardView['sort'],
    a: LeaderboardLine,
    b: LeaderboardLine,
    dir: 1 | -1 = 1,
) {
    const byRank = dir * (a.player.rank - b.player.rank);
    if (sort === 'winrate' && (a.rate === null || b.rate === null)) {
        return (a.rate === null ? 1 : 0) - (b.rate === null ? 1 : 0) || byRank;
    }
    return dir * order(sort, a, b) || byRank;
}

function order(sort: LeaderboardView['sort'], a: LeaderboardLine, b: LeaderboardLine) {
    const byRank = a.player.rank - b.player.rank;
    switch (sort) {
        case 'games':
            return b.games - a.games || byRank;
        case 'wins':
            return b.wins - a.wins || byRank;
        case 'winrate':
            if (a.rate === null || b.rate === null) {
                return (a.rate === null ? 1 : 0) - (b.rate === null ? 1 : 0) || byRank;
            }
            return b.rate - a.rate || b.games - a.games || byRank;
        case 'name':
            return (
                displayName(a.player).localeCompare(displayName(b.player), undefined, {
                    sensitivity: 'base',
                }) || byRank
            );
        default:
            return byRank;
    }
}
