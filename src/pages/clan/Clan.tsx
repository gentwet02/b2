import { getRouteApi } from '@tanstack/react-router';
import Page from '@/components/page/Page';
import ClanProfile from '@/features/clan/ClanProfile';

const routeApi = getRouteApi('/clan/$clanId');

export default function Clan() {
    const { clanId } = routeApi.useParams();

    return (
        <Page className='clan'>
            <ClanProfile key={clanId} clanId={clanId} />
        </Page>
    );
}
