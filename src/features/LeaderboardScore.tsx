import Table, { type Row } from '@/components/table/Table';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

interface LeaderboardData {
    body: Player[];
    error: string | null;
    success: boolean;
}

interface Player {
    displayName: string;
    score: number;
    currentlyInHoM: boolean;
    profile: string;
}

interface LeaderboardScoreProps {
    season: number;
    itemsPerPage?: number;
}

export default function LeaderboardScore(props: LeaderboardScoreProps) {
    const { season, itemsPerPage = 25 } = props;

    const { data, isLoading, error } = useQuery<LeaderboardData>({
        queryKey: ['leaderboard', season],
        queryFn: async () => {
            const response = await fetch(
                `https://data.ninjakiwi.com/battles2/homs/season_${season}/leaderboard`
            );
            if (!response.ok) throw new Error('Failed to fetch leaderboard');
            console.log('fetch');
            return response.json();
        },
    });

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error.message}</div>;
    if (!data?.body) return <div>No data available</div>;

    const rows = data.body.map((player, index): Row => {
        return {
            rank: index + 1,
            player: player.displayName,
            score: player.score,
            profile: (
                <Link to={`/user/${player.profile.split('/').at(-1)}`} className='profile-link'>
                    View Profile
                </Link>
            ),
        };
    });

    return (
        <div className='leaderboard__table-container'>
            <Table data={rows} disableSorting={true} itemsPerPage={itemsPerPage} />
            {data.body.length === 0 && (
                <div className='leaderboard__empty'>No players found for this season.</div>
            )}
        </div>
    );
}
