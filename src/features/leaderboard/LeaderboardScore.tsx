import { useMemo, type ReactNode } from 'react';
import RateBar from '@/components/rate-bar/RateBar';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import StatusMessage from '@/components/status/StatusMessage';
import Table from '@/components/table/Table';
import {
    LEADERBOARD_DEFAULT_SIZE,
    LEADERBOARD_MIN_GAMES_DEFAULT,
    LEADERBOARD_HEADER_SORTS,
    LEADERBOARD_PAGE_SIZES,
} from '@/config/leaderboard';
import useLeaderboardStats from '@/hooks/queries/useLeaderboardStats';
import useRankedPlayers from '@/hooks/queries/useRankedPlayers';
import usePlayerAvatars from '@/hooks/usePlayerAvatars';
import type { LeaderboardLine, LeaderboardView } from '@/types/leaderboard';
import type { Row, TableState, TableStateCause, TableStateInput } from '@/types/table';
import { formatNumber } from '@/utils/format';
import { compareLines } from '@/utils/leaderboard';
import { recordTitle, winRate } from '@/utils/record';
import PlayerName from './PlayerName';

interface LeaderboardScoreProps {
    season: number;
    live?: boolean | undefined;
    itemsPerPage?: number | undefined;
    /** only these ranks (the home page's 4 to 25), not sortable or searchable */
    range?: [number, number] | undefined;
    view?: LeaderboardView | undefined;
    /** a click on a column header: sort by it, or reverse it when it's already the sort */
    onViewChange?: ((patch: LeaderboardView) => void) | undefined;
    /** extra controls next to the page size selector */
    controls?: ReactNode;
    tableState?: TableStateInput | undefined;
    onTableStateChange?: ((next: TableState, cause: TableStateCause) => void) | undefined;
}

export default function LeaderboardScore(props: LeaderboardScoreProps) {
    const {
        season,
        live = false,
        itemsPerPage = LEADERBOARD_DEFAULT_SIZE,
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
    const minGames = view?.minGames ?? LEADERBOARD_MIN_GAMES_DEFAULT;
    // the header shows the current sort; a second click on it reverses the order
    const headerKey = Object.keys(LEADERBOARD_HEADER_SORTS).find(
        (key) => LEADERBOARD_HEADER_SORTS[key]!.sort === sort,
    );
    const headerSort = headerKey
        ? {
              key: headerKey,
              direction:
                  (LEADERBOARD_HEADER_SORTS[headerKey]!.first === 'asc') !== !!view?.reverse
                      ? ('asc' as const)
                      : ('desc' as const),
          }
        : null;
    const sortBy = onViewChange
        ? (key: string) => {
              const next = LEADERBOARD_HEADER_SORTS[key];
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
        const all = visible.map((player): LeaderboardLine => {
            const [wins, losses, draws] = stats?.records[player.id] ?? [0, 0, 0];
            return {
                player,
                wins,
                losses,
                draws,
                games: wins + losses + draws,
                rate: winRate(wins, losses),
            };
        });
        if (range) return all;
        const dir = view?.reverse ? -1 : 1;
        return all.filter((l) => l.games >= minGames).sort((a, b) => compareLines(sort, a, b, dir));
    }, [players, range, stats, sort, minGames, view?.reverse]);

    const rows = useMemo(
        () =>
            lines.map(({ player, wins, losses, draws, games, rate }): Row => ({
                rank: (
                    <span
                        className={`lb-rank${player.rank <= 3 ? ` lb-rank--${player.rank}` : ''}`}
                    >
                        {formatNumber(player.rank)}
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
                        <RateBar rate={rate} title={recordTitle([wins, losses, draws])} />
                    ),
            })),
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
                sortable={range ? [] : Object.keys(LEADERBOARD_HEADER_SORTS)}
                controls={controls}
                disableSorting={!!range}
                disableSearch={!!range}
                disablePageSize={!!range}
                itemsPerPage={range ? Math.max(1, rows.length) : itemsPerPage}
                pageSizeOptions={LEADERBOARD_PAGE_SIZES}
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
