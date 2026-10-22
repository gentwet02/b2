import { useMemo, type ReactNode } from 'react';
import { ErrorState, Loading, StatusMessage } from '@/components/status/Status';
import Table from '@/components/table/Table';
import useLeaderboardStats from '@/hooks/useLeaderboardStats';
import usePlayerAvatars from '@/hooks/usePlayerAvatars';
import { useRankedPlayers } from '@/hooks/useRankedPlayers';
import type { LeaderboardPlayer, LeaderboardSort, LeaderboardView } from '@/types/leaderboard';
import type { Row, TableState, TableStateCause, TableStateInput } from '@/types/table';
import { formatNumber } from '@/utils/format';
import { PlayerName } from './PlayerName';

export interface RankedPlayer extends LeaderboardPlayer {
    rank: number;
}

interface LeaderboardScoreProps {
    season: number;
    live?: boolean | undefined;
    itemsPerPage?: number | undefined;
    range?: [number, number] | undefined;
    view?: LeaderboardView | undefined;
    /** a click on a column header: sort by it, or reverse it when it's already the sort */
    onViewChange?: ((patch: LeaderboardView) => void) | undefined;
    /** extra controls next to the page size selector */
    controls?: ReactNode;
    tableState?: TableStateInput | undefined;
    onTableStateChange?: ((next: TableState, cause: TableStateCause) => void) | undefined;
}

interface Line {
    player: RankedPlayer;
    wins: number;
    losses: number;
    draws: number;
    games: number;
    rate: number | null;
}

const displayName = (p: LeaderboardPlayer) => p.alias || p.name;

/** `dir` -1: the sort's opposite order (players without a win rate stay last). */
function compare(sort: LeaderboardView['sort'], a: Line, b: Line, dir: 1 | -1 = 1) {
    const byRank = dir * (a.player.rank - b.player.rank);
    if (sort === 'winrate' && (a.rate === null || b.rate === null)) {
        return (a.rate === null ? 1 : 0) - (b.rate === null ? 1 : 0) || byRank;
    }
    return dir * order(sort, a, b) || byRank;
}

function order(sort: LeaderboardView['sort'], a: Line, b: Line) {
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

/** Table column → leaderboard sort, and the sort's first direction. */
const HEADER_SORTS: Record<string, { sort: LeaderboardSort; first: 'asc' | 'desc' }> = {
    rank: { sort: 'rank', first: 'asc' },
    player: { sort: 'name', first: 'asc' },
    score: { sort: 'score', first: 'desc' },
    games: { sort: 'games', first: 'desc' },
    'win-rate': { sort: 'winrate', first: 'desc' },
};

export default function LeaderboardScore(props: LeaderboardScoreProps) {
    const {
        season,
        live = false,
        itemsPerPage = 25,
        range,
        view,
        onViewChange,
        controls,
        tableState,
        onTableStateChange,
    } = props;

    const { players, isLoading, error, refetch } = useRankedPlayers(season, live);
    const { data: stats, isPending: statsPending } = useLeaderboardStats(season);
    const avatars = usePlayerAvatars(stats?.avatars);

    const sort = view?.sort ?? 'rank';
    const minGames = view?.minGames ?? 0;
    const headerKey = Object.keys(HEADER_SORTS).find((key) => HEADER_SORTS[key]!.sort === sort);
    const headerSort = headerKey
        ? {
              key: headerKey,
              direction:
                  (HEADER_SORTS[headerKey]!.first === 'asc') !== !!view?.reverse
                      ? ('asc' as const)
                      : ('desc' as const),
          }
        : null;
    const sortBy = onViewChange
        ? (key: string) => {
              const next = HEADER_SORTS[key];
              if (!next) return;
              onViewChange(
                  next.sort === sort
                      ? { reverse: !view?.reverse }
                      : { sort: next.sort, reverse: false },
              );
          }
        : undefined;

    const lines = useMemo(() => {
        const visible = range ? players.slice(range[0] - 1, range[1]) : players;
        const all = visible.map((player): Line => {
            const [wins, losses, draws] = stats?.records[player.id] ?? [0, 0, 0];
            return {
                player,
                wins,
                losses,
                draws,
                games: wins + losses + draws,
                rate: wins + losses > 0 ? (wins / (wins + losses)) * 100 : null,
            };
        });
        if (range) return all;
        const dir = view?.reverse ? -1 : 1;
        return all.filter((l) => l.games >= minGames).sort((a, b) => compare(sort, a, b, dir));
    }, [players, range, stats, sort, minGames, view?.reverse]);

    const rows = useMemo(
        () =>
            lines.map(
                ({ player, wins, losses, draws, games, rate }): Row => ({
                    rank: (
                        <span
                            className={`lb-rank${player.rank <= 3 ? ` lb-rank--${player.rank}` : ''}`}
                        >
                            {player.rank}
                        </span>
                    ),
                    player: (
                        <PlayerName
                            player={player}
                            avatar={avatars[player.id]}
                            avatarReady={!statsPending}
                        />
                    ),
                    score: <span className='lb-score'>{formatNumber(player.score)}</span>,
                    games: <span className='lb-num'>{stats ? formatNumber(games) : '…'}</span>,
                    winRate:
                        rate === null ? (
                            <span className='lb-num lb-num--empty'>–</span>
                        ) : (
                            <span
                                className='lb-rate'
                                title={`${wins} won, ${draws} drawn, ${losses} lost`}
                            >
                                <span className='lb-rate__value'>{rate.toFixed(0)}%</span>
                                <span className='lb-rate__bar' aria-hidden='true'>
                                    <span style={{ width: `${rate}%` }} />
                                </span>
                            </span>
                        ),
                }),
            ),
        [lines, avatars, stats, statsPending],
    );

    const searchText = useMemo(
        () => lines.map(({ player }) => [player.alias, player.name].filter(Boolean).join(' ')),
        [lines],
    );
    const searchIds = useMemo(() => lines.map(({ player }) => player.id), [lines]);

    if (isLoading) {
        return (
            <Loading
                label={
                    live
                        ? 'Loading leaderboard…'
                        : 'Loading this season. The first visit after an update can take a few seconds.'
                }
            />
        );
    }
    if (error) return <ErrorState error={error} onRetry={() => refetch()} />;
    if (players.length === 0) {
        return (
            <StatusMessage title='No players yet'>
                Nobody has a Hall of Masters score this season so far.
            </StatusMessage>
        );
    }

    return (
        <div className='leaderboard-score'>
            <Table
                name='leaderboard'
                categories={[
                    { name: 'rank', title: 'Rank' },
                    { name: 'player', title: 'Player' },
                    { name: 'score', title: 'Score' },
                    { name: 'games', title: 'Games' },
                    { name: 'win-rate', title: 'Win rate' },
                ]}
                data={rows}
                sort={headerSort}
                onSort={range ? undefined : sortBy}
                sortable={range ? [] : Object.keys(HEADER_SORTS)}
                controls={controls}
                disableSorting={!!range}
                disableSearch={!!range}
                disablePageSize={!!range}
                itemsPerPage={range ? Math.max(1, rows.length) : itemsPerPage}
                pageSizeOptions={[10, 25, 50, 100]}
                searchPlaceHolder='Find a player'
                searchAriaLabel='Find a player by name or full id'
                searchText={searchText}
                searchExact={searchIds}
                state={range ? undefined : tableState}
                onStateChange={range ? undefined : onTableStateChange}
            />
        </div>
    );
}
