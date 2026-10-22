import PanelEmpty from '@/components/panel/PanelEmpty';
import useRankHistory from '@/hooks/queries/useRankHistory';
import type { ProfileStats, StatDetail } from '@/types/profile';
import { formatNumber } from '@/utils/format';
import StatCard from './StatCard';
import StatDetails from './StatDetails';
import WinLossSummary from './WinLossSummary';

interface AllTimeStatsProps {
    userId: string;
    /** NK's lifetime ranked stats; undefined while the profile loads */
    stats: ProfileStats | undefined;
    loading: boolean;
}

/** NK's lifetime ranked record, with the best finish and seasons from our rank history. */
export default function AllTimeStats(props: AllTimeStatsProps) {
    const { userId, stats, loading } = props;

    const { data: ranks } = useRankHistory(userId);

    if (!stats) {
        return (
            <StatCard title='Ranked, all time' placeholder busy={loading}>
                <PanelEmpty>{loading ? 'Loading…' : 'Not available.'}</PanelEmpty>
            </StatCard>
        );
    }

    const details: StatDetail[] = [
        { label: 'Current win streak', value: formatNumber(stats.win_streak ?? 0) },
        { label: 'Best win streak', value: formatNumber(stats.highest_win_streak ?? 0) },
        { label: 'Wins without losing a life', value: formatNumber(stats.no_lives_lost ?? 0) },
        { label: 'First bloon popped', value: formatNumber(stats.first_bloons ?? 0) },
    ];
    if (ranks?.best) {
        details.push({
            label: 'Best season finish',
            value: (
                <>
                    #{ranks.best.rank} <span className='stats-panel__sub'>{ranks.best.name}</span>
                </>
            ),
        });
    }
    if (ranks?.current) {
        details.push({ label: 'Rank this season', value: <>#{ranks.current.rank}</> });
    }
    if (ranks && ranks.seasons.length > 0) {
        details.push({ label: 'Seasons in the Hall of Masters', value: ranks.seasons.length });
    }

    return (
        <StatCard title='Ranked, all time'>
            <WinLossSummary wins={stats.wins} draws={stats.draws} losses={stats.losses} />
            <StatDetails details={details} />
        </StatCard>
    );
}
