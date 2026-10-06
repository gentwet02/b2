import Table, { type Row } from '@/components/table/Table';
import useLeaderboard from '@/hooks/useLeaderboard';
import { decodeLeaderboardPlayer } from '@/utils/decode';
import { Link } from '@tanstack/react-router';

interface LeaderboardScoreProps {
    season: number;
    itemsPerPage?: number;
}

export default function LeaderboardScore(props: LeaderboardScoreProps) {
    const { season, itemsPerPage = 25 } = props;

    const {
        data: leaderboardResponse,
        isLoading: isLeaderboardLoading,
        error: leaderboardError,
    } = useLeaderboard(season);

    const leaderboard = leaderboardResponse?.data?.data;

    if (isLeaderboardLoading) return <div>Loading...</div>;
    if (leaderboardError) return <div>Error: {leaderboardError.message}</div>;
    if (!leaderboard) return <div>No data available</div>;

    const rows = leaderboard.map((p, i): Row => {
        const player = decodeLeaderboardPlayer(p);
        return {
            rank: i + 1,
            player: player.realName || player.name,
            score: player.score,
            profile: (
                <Link to={`/user/${player.id}`} className='profile-link'>
                    View Profile
                </Link>
            ),
        };
    });

    return (
        <div className='leaderboard__table-container'>
            <Table
                data={rows}
                disableSorting={true}
                itemsPerPage={itemsPerPage}
                pageSizeOptions={[10, 25, 50, 100]}
            />
            {leaderboard.length === 0 && (
                <div className='leaderboard__empty'>No players found for this season.</div>
            )}
        </div>
    );
}
