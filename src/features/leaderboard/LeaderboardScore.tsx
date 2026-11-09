import { useCallback, useMemo, type ReactNode } from 'react';
import RateBar from '@/components/rate-bar/RateBar';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import StatusMessage from '@/components/status/StatusMessage';
import Table from '@/components/table/Table';
import {
    LEADERBOARD_MIN_GAMES_DEFAULT,
    LEADERBOARD_HEADER_SORTS,
    LEADERBOARD_SORT_DEFAULT,
} from '@/config/leaderboard';
import useLeaderboardStats from '@/hooks/queries/useLeaderboardStats';
import useRankedPlayers from '@/hooks/queries/useRankedPlayers';
import usePlayerAvatars from '@/hooks/usePlayerAvatars';
import type { LeaderboardLine, LeaderboardView } from '@/types/leaderboard';
import type { Row, TableState, TableStateCause, TableStateInput } from '@/types/table';
import { mods } from '@/utils/className';
import { formatNumber } from '@/utils/format';
import { compareLines } from '@/utils/leaderboard';
import { playerMatches } from '@/utils/player';
import { recordTitle, winRate } from '@/utils/record';
import PlayerName from './PlayerName';

interface LeaderboardScoreProps {
    season: number;
    live?: boolean | undefined;
    /** only these ranks (the home page's 4 to 25), not sortable or searchable */
    range?: [number, number] | undefined;
    view?: LeaderboardView | undefined;
    /** a click on a column header: sort by it, or reverse it when it's already the sort */
    onViewChange?: ((patch: LeaderboardView) => void) | undefined;
    /** extra controls next to the search */
    controls?: ReactNode;
    tableState?: TableStateInput | undefined;
    onTableStateChange?: ((next: TableState, cause: TableStateCause) => void) | undefined;
}

export default function LeaderboardScore(props: LeaderboardScoreProps) {
    const {
        season,
        live = false,
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
    const oldNames = !!view?.allNames;

    const sort = view?.sort ?? LEADERBOARD_SORT_DEFAULT;
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
            lines.map(
                ({ player, wins, losses, draws, games, rate }): Row => ({
                    rank: (
                        <span className={mods('lb-rank', player.rank <= 3 && String(player.rank))}>
                            {formatNumber(player.rank)}
                        </span>
                    ),
                    player: (
                        <PlayerName
                            player={player}
                            avatar={avatars[player.id]}
                            avatarReady={!statsPending}
                            searchTerm={tableState?.search}
                            withOldNames={oldNames}
                        />
                    ),
                    score: <span className='lb-score'>{formatNumber(player.score)}</span>,
                    games: <span className='lb-num'>{stats ? formatNumber(games) : '…'}</span>,
                    winRate:
                        rate === null ? (
                            <span className='lb-num--empty'>–</span>
                        ) : (
                            <RateBar rate={rate} title={recordTitle([wins, losses, draws])} />
                        ),
                }),
            ),
        [lines, avatars, stats, statsPending, tableState?.search, oldNames],
    );

    const searchMatch = useCallback(
        (i: number, term: string) => {
            const player = lines[i]?.player;
            return !!player && playerMatches(player, player.id, term, oldNames);
        },
        [lines, oldNames],
    );

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
                disablePageSize
                itemsPerPage={Math.max(1, rows.length)}
                virtual={!range}
                searchPlaceHolder='Find a player'
                searchAriaLabel='Find a player by name, alias, id or tag'
                searchMatch={searchMatch}
                state={range ? undefined : tableState}
                onStateChange={range ? undefined : onTableStateChange}
            />
        </div>
    );
}
