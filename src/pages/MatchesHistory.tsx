import Table, { type Row } from '@/components/table/Table';
import useMatchesHistory from '@/hooks/useMatchesHistory';

export default function MatchesHistory() {
    const { data, isLoading, error } = useMatchesHistory();

    if (isLoading) {
        return <>Loading...</>;
    }

    if (error || !data?.data?.matches) {
        return <>Error!</>;
    }

    const matches = data.data?.matches.matches;

    const rows = matches.map((match): Row => {
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

    return (
        <div className='matches-history__table-container'>
            <Table data={rows} />
            {matches.length === 0 && (
                <div className='matches-history__empty'>No players found for this season.</div>
            )}
        </div>
    );
}
