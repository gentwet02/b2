import PanelEmpty from '@/components/panel/PanelEmpty';
import ErrorState from '@/components/status/ErrorState';
import useSeasonStats from '@/hooks/queries/useSeasonStats';
import type { StatDetail } from '@/types/profile';
import { heroImage } from '@/utils/assetOverrides';
import { formatNumber } from '@/utils/format';
import { formatHero } from '@/utils/hero';
import { seasonTitle } from '@/utils/season';
import StatCard from './StatCard';
import StatDetails from './StatDetails';
import WinLossSummary from './WinLossSummary';

interface SeasonRecordProps {
    userId: string;
}

/** This season's ranked record, from the matches and profile readings our server recorded. */
export default function SeasonRecord(props: SeasonRecordProps) {
    const { userId } = props;

    const { data, isLoading, error, refetch } = useSeasonStats(userId);

    if (isLoading) {
        return (
            <StatCard title='This season' accent placeholder busy>
                <PanelEmpty>Loading the season record…</PanelEmpty>
            </StatCard>
        );
    }
    if (error || !data) {
        return (
            <StatCard title='This season'>
                <ErrorState error={error} onRetry={() => refetch()} />
            </StatCard>
        );
    }

    const { wins, losses, draws } = data;
    const streak = (value: number | null) => (value === null ? '–' : formatNumber(value));
    const topHero = data.heroes[0];

    const details: StatDetail[] = [
        { label: 'Current win streak', value: streak(data.winStreak) },
        { label: 'Best win streak', value: streak(data.bestWinStreak) },
    ];
    if (topHero) {
        const portrait = heroImage(topHero.hero, topHero.portrait);
        details.push({
            label: 'Most played hero',
            className: 'stats-panel__hero',
            value: (
                <>
                    {portrait && <img className='stats-panel__hero-img' src={portrait} alt='' />}
                    <span>
                        {formatHero(topHero.hero)}{' '}
                        <span className='stats-panel__sub'>
                            {formatNumber(topHero.wins)}/{formatNumber(topHero.played)} won
                        </span>
                    </span>
                </>
            ),
        });
    }
    details.push({ label: 'Matches recorded', value: formatNumber(data.recorded) });

    return (
        <StatCard
            accent
            title={
                <>
                    {data.seasonName ? seasonTitle(data.seasonName) : 'This season'}{' '}
                    <span className='stats-panel__tag'>Ranked</span>
                </>
            }
        >
            {wins + losses + draws === 0 ? (
                <PanelEmpty>No ranked match recorded for this player this season yet.</PanelEmpty>
            ) : (
                <>
                    <WinLossSummary wins={wins} draws={draws} losses={losses} />
                    <StatDetails details={details} />
                </>
            )}
        </StatCard>
    );
}
