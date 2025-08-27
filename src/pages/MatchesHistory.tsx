import Table, { type Row } from '@/components/table/Table';
import { matchesService } from '@/services/api/matchesHistory';
import type { ApiResponse } from '@/types/api';
import type { MatchesResponse } from '@/types/match';
import { useQuery } from '@tanstack/react-query';

export default function MatchesHistory() {
    const { data, isLoading, error } = useQuery<ApiResponse<MatchesResponse>>({
        queryKey: ['matchesHistory'],
        queryFn: async () => {
            const response = await matchesService.getMatchesRecentHistory();
            if (!response.success) throw new Error('Failed to fetch leaderboard');
            console.log('fetch matches history');
            return response;
        },
    });

    if (isLoading) {
        return <></>;
    }

    if (error || !data) {
        return <></>;
    }

    const rows = data.data?.matches.matches.map((match): Row => {
        return {
            id: match.id,
            gametype: match.gametype,
            map: match.map,
            duration: match.duration,
            endRound: match.endRound,
            mapImg: <img src={match.mapURL} style={{ width: 100 }} />,
            playerLeft: match.playerLeft.displayName,
            playerRight: match.playerRight.displayName,
        };
    });

    if (!rows) {
        return <></>;
    }

    return (
        <div className='matches-history__table-container'>
            <Table data={rows} />
            {data?.data?.matches.matches.length === 0 && (
                <div className='matches-history__empty'>No players found for this season.</div>
            )}
        </div>
    );
}
