import Table, { type Row } from '@/components/table/Table';
import { ErrorState, Loading, StatusMessage } from '@/components/status/Status';
import type { LeaderboardPlayer } from '@/types/leaderboard';
import { formatNumber } from '@/utils/format';
import { Link } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useRankedPlayers } from '@/hooks/useRankedPlayers';

export interface RankedPlayer extends LeaderboardPlayer {
    rank: number;
}

export function PlayerName({ player }: { player: LeaderboardPlayer }) {
    const alias = player.realName && player.realName !== player.name ? player.name : null;
    return (
        <span className='lb-player'>
            <Link to='/user/$userId' params={{ userId: player.id }} className='lb-player__name'>
                {player.realName || player.name}
            </Link>
            {alias && <span className='lb-player__alias'>{alias}</span>}
        </span>
    );
}

interface LeaderboardScoreProps {
    season: number;
    live?: boolean;
    itemsPerPage?: number;
    /** Show only ranks from..to (1-based, inclusive), without table controls. */
    range?: [number, number];
}

export default function LeaderboardScore(props: LeaderboardScoreProps) {
    const { season, live = false, itemsPerPage = 25, range } = props;
    const { players, isLoading, error, refetch } = useRankedPlayers(season, live);

    const rows = useMemo(() => {
        const visible = range ? players.slice(range[0] - 1, range[1]) : players;
        return visible.map(
            (player): Row => ({
                rank: (
                    <span
                        className={`lb-rank${player.rank <= 3 ? ` lb-rank--${player.rank}` : ''}`}
                    >
                        {player.rank}
                    </span>
                ),
                player: <PlayerName player={player} />,
                hall: player.currentlyInHoM ? (
                    <span className='lb-hom' title='Currently in the Hall of Masters'>
                        In HoM
                    </span>
                ) : (
                    <span className='lb-hom lb-hom--out' title='Dropped out of the Hall of Masters'>
                        Demoted
                    </span>
                ),
                score: <span className='lb-score'>{formatNumber(player.score)}</span>,
            }),
        );
    }, [players, range]);

    if (isLoading) return <Loading label='Loading leaderboard…' />;
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
                    { name: 'hall', title: 'Status' },
                    { name: 'score', title: 'Score' },
                ]}
                data={rows}
                disableSorting
                disableSearch={!!range}
                disablePageSize={!!range}
                itemsPerPage={range ? Math.max(1, rows.length) : itemsPerPage}
                pageSizeOptions={[10, 25, 50, 100]}
                searchPlaceHolder='Find a player'
                searchAriaLabel='Find a player by name'
            />
        </div>
    );
}
