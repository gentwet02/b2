import { Link } from '@tanstack/react-router';
import type { Clan } from '@/types/profile';
import { formatNumber } from '@/utils/format';

interface ClanCardProps {
    clan: Clan;
}

export default function ClanCard(props: ClanCardProps) {
    const { clan } = props;

    return (
        <section className='panel clan-card' aria-labelledby='clan-name'>
            {clan.bannerURL && <img className='clan-card__banner' src={clan.bannerURL} alt='' />}
            <div className='clan-card__body'>
                <p className='clan-card__eyebrow'>Clan</p>
                <h2 id='clan-name' className='clan-card__name'>
                    {clan.name}
                </h2>
                {clan.tagline && <p className='clan-card__tagline'>{clan.tagline}</p>}
                <dl className='clan-card__facts'>
                    <div className='clan-card__fact'>
                        <dt>Members</dt>
                        <dd>{formatNumber(clan.members)}</dd>
                    </div>
                    {clan.ownerId && clan.ownerName && (
                        <div className='clan-card__fact'>
                            <dt>Leader</dt>
                            <dd>
                                <Link to='/user/$userId' params={{ userId: clan.ownerId }}>
                                    {clan.ownerName}
                                </Link>
                            </dd>
                        </div>
                    )}
                </dl>
            </div>
        </section>
    );
}
