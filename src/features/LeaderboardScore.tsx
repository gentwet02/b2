import Table, { type Row, type TableState, type TableStateCause } from '@/components/table/Table';
import { ErrorState, Loading, StatusMessage } from '@/components/status/Status';
import useLeaderboardStats from '@/hooks/useLeaderboardStats';
import type { LeaderboardPlayer } from '@/types/leaderboard';
import { formatNumber } from '@/utils/format';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useRankedPlayers } from '@/hooks/useRankedPlayers';

export interface RankedPlayer extends LeaderboardPlayer {
    rank: number;
}

export function PlayerName({ player, avatar }: { player: LeaderboardPlayer; avatar?: string }) {
    const alias = player.realName && player.realName !== player.name ? player.name : null;
    return (
        <span className='lb-player'>
            {avatar ? (
                <img
                    className='lb-player__avatar'
                    src={avatar}
                    alt=''
                    loading='lazy'
                    width={36}
                    height={36}
                />
            ) : (
                <span className='lb-player__avatar lb-player__avatar--empty' aria-hidden='true'>
                    {(player.realName || player.name).charAt(0).toUpperCase()}
                </span>
            )}
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
    live?: boolean;
    itemsPerPage?: number;
    /** Show only ranks from..to (1-based, inclusive), without table controls. */
    range?: [number, number];
    tableState?: Partial<TableState>;
    onTableStateChange?: (next: TableState, cause: TableStateCause) => void;
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
                player: <PlayerName player={player} avatar={stats?.avatars[player.id] || ''} />,
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
    }, [players, range, stats]);

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
