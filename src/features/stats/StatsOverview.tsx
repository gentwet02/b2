import Results from '@/components/results/Results';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import VersusSeasons from '@/features/compare/VersusSeasons';
import VersusSummary from '@/features/compare/VersusSummary';
import type useComparison from '@/hooks/queries/useComparison';

interface StatsOverviewProps {
    /** the /compare answer for the sides and filters */
    comparison: ReturnType<typeof useComparison>;
    /** the answer shown is for other sides: dimmed until the new one comes */
    updating: boolean;
    /** no hero or tower filter on either side (the sides can mirror each other) */
    mirrored: boolean;
}

/** Above the tables: the record between the sides, their best and worst picks, each season. */
export default function StatsOverview(props: StatsOverviewProps) {
    const { comparison, updating, mirrored } = props;
    const { data, isLoading, error, refetch } = comparison;

    if (isLoading) return <Loading label='Looking up the games…' />;
    if (error || !data) return <ErrorState error={error} onRetry={() => refetch()} />;
    return (
        <Results updating={updating}>
            <VersusSummary data={data} mirrored={mirrored} />
            <VersusSeasons data={data} />
        </Results>
    );
}
