import { getRouteApi } from '@tanstack/react-router';
import SeasonRecords from '@/components/season-records/SeasonRecords';
import { PROFILE_SEASON_DEFAULT } from '@/config/profile';
import useSeasonRecords from '@/hooks/queries/useSeasonRecords';

const routeApi = getRouteApi('/user/$userId');

interface SeasonHistoryProps {
    userId: string;
}

/** W–D–L and win rate of every season we recorded the player in, newest first. */
export default function SeasonHistory(props: SeasonHistoryProps) {
    const { userId } = props;

    const { data } = useSeasonRecords(userId);
    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();

    function setAmount(n: number) {
        navigate({
            search: (prev) => ({ ...prev, seasons: n === PROFILE_SEASON_DEFAULT ? undefined : n }),
            replace: true,
            resetScroll: false,
        });
    }

    return (
        <SeasonRecords
            seasons={data ?? []}
            amount={search.seasons ?? PROFILE_SEASON_DEFAULT}
            onAmount={setAmount}
        />
    );
}
