import PlayerAvatar from '@/components/avatar/PlayerAvatar';
import { ErrorState, Loading, StatusMessage } from '@/components/status/Status';
import Table from '@/components/table/Table';
import useLeaderboardStats from '@/hooks/useLeaderboardStats';
import usePlayerAvatars from '@/hooks/usePlayerAvatars';
import { useRankedPlayers } from '@/hooks/useRankedPlayers';
import type { LeaderboardPlayer, LeaderboardView } from '@/types/leaderboard';
import type { Row, TableState, TableStateCause, TableStateInput } from '@/types/table';
import { formatNumber } from '@/utils/format';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';

export interface RankedPlayer extends LeaderboardPlayer {
    rank: number;
}

export function PlayerName({
    player,
    avatar,
}: {
    player: LeaderboardPlayer;
    avatar?: string | undefined;
}) {
    const alias = player.realName && player.realName !== player.name ? player.name : null;
    return (
        <span className='lb-player'>
            <PlayerAvatar
                className='lb-player__avatar'
                src={avatar}
                name={player.realName || player.name}
                size={36}
                lazy
            />
            <span className='lb-player__names'>
                <Link to='/user/$userId' params={{ userId: player.id }} className='lb-player__name'>
                    {player.realName || player.name}
                </Link>
                {alias && <span className='lb-player__alias'>{alias}</span>}
            </span>
        </span>
    );
}

interface LeaderboardScoreProps {
    season: number;
    live?: boolean | undefined;
    itemsPerPage?: number | undefined;
    /** Show only ranks from..to (1-based, inclusive), without table controls. */
    range?: [number, number] | undefined;
    /** sort and filters; missing = by rank, everybody */
    view?: LeaderboardView | undefined;
    /** page, page size and search kept by the parent (the URL); the table keeps its own without */
    tableState?: TableStateInput | undefined;
    onTableStateChange?: ((next: TableState, cause: TableStateCause) => void) | undefined;
}

interface Line {
    player: RankedPlayer;
    wins: number;
    losses: number;
    draws: number;
    games: number;
    /** % of decided games won, null without any */
    rate: number | null;
}

const displayName = (p: LeaderboardPlayer) => p.realName || p.name;

function compare(sort: LeaderboardView['sort'], a: Line, b: Line) {
    const byRank = a.player.rank - b.player.rank;
    switch (sort) {
        case 'games':
            return b.games - a.games || byRank;
        case 'wins':
            return b.wins - a.wins || byRank;
        case 'winrate':
            // players without decided games go last
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

export default function LeaderboardScore(props: LeaderboardScoreProps) {
    const {
        season,
        live = false,
        itemsPerPage = 25,
        range,
        view,
        tableState,
        onTableStateChange,
    } = props;
    const { players, isLoading, error, refetch } = useRankedPlayers(season, live);
    const { data: stats } = useLeaderboardStats(season);
    const avatars = usePlayerAvatars(stats?.avatars);
    const avatarsKey = JSON.stringify(avatars);

    const sort = view?.sort ?? 'rank';
    const minGames = view?.minGames ?? 0;
    const knownOnly = view?.knownOnly ?? false;

    // sorted and filtered players; rows and search text are built from the same list,
    // so the table can match them by index
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
        return all
            .filter((l) => l.games >= minGames && (!knownOnly || !!l.player.realName))
            .sort((a, b) => compare(sort, a, b));
    }, [players, range, stats, sort, minGames, knownOnly]);

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
                    player: <PlayerName player={player} avatar={avatars[player.id]} />,
                    score: <span className='lb-score'>{formatNumber(player.score)}</span>,
                    games: <span className='lb-num'>{stats ? formatNumber(games) : '…'}</span>,
                    winRate:
                        rate === null ? (
                            <span className='lb-num lb-num--empty'>–</span>
                        ) : (
                            <span
                                className='lb-rate'
                                title={`${wins} won, ${losses} lost, ${draws} drawn`}
                            >
                                <span className='lb-rate__value'>{rate.toFixed(0)}%</span>
                                <span className='lb-rate__bar' aria-hidden='true'>
                                    <span style={{ width: `${rate}%` }} />
                                </span>
                            </span>
                        ),
                }),
            ),
        // avatars is rebuilt each render; its content is what matters
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [lines, stats, avatarsKey],
    );

    const searchText = useMemo(
        () => lines.map(({ player }) => [player.realName, player.name].filter(Boolean).join(' ')),
        [lines],
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
                disableSorting
                disableSearch={!!range}
                disablePageSize={!!range}
                itemsPerPage={range ? Math.max(1, rows.length) : itemsPerPage}
                pageSizeOptions={[10, 25, 50, 100]}
                searchPlaceHolder='Find a player'
                searchAriaLabel='Find a player by name'
                searchText={searchText}
                state={range ? undefined : tableState}
                onStateChange={range ? undefined : onTableStateChange}
            />
            {stats && (
                <p className='leaderboard-score__note'>
                    Games and win rate count the ranked matches our server recorded this season.
                </p>
            )}
        </div>
    );
}
