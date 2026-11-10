import { getRouteApi } from '@tanstack/react-router';
import SeasonRecords from '@/components/season-records/SeasonRecords';
import { PROFILE_SEASON_DEFAULT } from '@/config/profile';
import type { SeasonRecord } from '@/types/record';

const routeApi = getRouteApi('/clan/$clanId');

interface ClanSeasonsProps {
    /** the clan's members' games added up, season by season, newest first */
    seasons: SeasonRecord[];
}

/** W–D–L and win rate of the clan in every season its members have a recorded game in. */
export default function ClanSeasons(props: ClanSeasonsProps) {
    const { seasons } = props;

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
            seasons={seasons}
            amount={search.seasons ?? PROFILE_SEASON_DEFAULT}
            onAmount={setAmount}
        />
    );
}
