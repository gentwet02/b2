import LeaderboardScore from '@/features/LeaderboardScore';
import { useQuery } from '@tanstack/react-query';

interface Season {
    id: string;
    name: string;
    start: number;
    end: number;
    live: boolean;
    totalScores: number;
    leaderboard: string;
}

interface SeasonsData {
    error: Error;
    success: boolean;
    body: Season[];
}

export default function Home() {
    const { data, isLoading, error } = useQuery<SeasonsData>({
        queryKey: ['seasons'],
        queryFn: async () => {
            const response = await fetch('https://data.ninjakiwi.com/battles2/homs');
            if (!response.ok) throw new Error('Failed to fetch leaderboard');
            console.log('fetch');
            return response.json();
        },
    });

    let currentSeason: number | undefined;

    if (!isLoading && !error && data?.body) {
        data.body.forEach((season) => {
            if (season.live === true) {
                const seasonStr = season.name.split('Season ')[1];
                if (seasonStr) currentSeason = +seasonStr - 1;
            }
        });
    }

    return (
        <main className='home'>
            {currentSeason && (
                <div className='home__leaderboard'>
                    <LeaderboardScore season={currentSeason} itemsPerPage={10} />
                </div>
            )}
        </main>
    );
}
