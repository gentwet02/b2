import PlayerAvatar from '@/components/avatar/PlayerAvatar';
import { ErrorState, Loading, StatusMessage } from '@/components/status/Status';
import Table from '@/components/table/Table';
import useLeaderboardStats from '@/hooks/useLeaderboardStats';
import usePlayerAvatars from '@/hooks/usePlayerAvatars';
import { useRankedPlayers } from '@/hooks/useRankedPlayers';
import type { LeaderboardPlayer } from '@/types/leaderboard';
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
    /** page, page size and search kept by the parent (the URL); the table keeps its own without */
    tableState?: TableStateInput | undefined;
    onTableStateChange?: ((next: TableState, cause: TableStateCause) => void) | undefined;
}

export default function LeaderboardScore(props: LeaderboardScoreProps) {
    const {
        season,
        live = false,
        itemsPerPage = 25,
        range,
        tableState,
        onTableStateChange,
    } = props;
    const { players, isLoading, error, refetch } = useRankedPlayers(season, live);
    const { data: stats } = useLeaderboardStats(season);
    const avatars = usePlayerAvatars(stats?.avatars);

    const rows = useMemo(() => {
        const visible = range ? players.slice(range[0] - 1, range[1]) : players;
        return visible.map((player): Row => {
            const record = stats?.records[player.id];
            const [wins, losses, draws] = record ?? [0, 0, 0];
            const games = wins + losses + draws;
            const rate = wins + losses > 0 ? (wins / (wins + losses)) * 100 : null;
            return {
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
            };
        });
        // avatars is rebuilt each render; its content only changes with stats or a visited profile
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [players, range, stats, JSON.stringify(avatars)]);

    const searchText = useMemo(
        () =>
            (range ? players.slice(range[0] - 1, range[1]) : players).map((p) =>
                [p.realName, p.name].filter(Boolean).join(' '),
            ),
        [players, range],
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
