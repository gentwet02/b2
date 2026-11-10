import { Link } from '@tanstack/react-router';
// shared: the profile's hero
import '@/features/profile/ProfileHero.scss';
import type { Clan } from '@/types/clan';
import { formatNumber } from '@/utils/format';

interface ClanHeroProps {
    clan: Clan;
    /** the members our server knows (HoM players) */
    known: number;
}

/** The top of a clan's page, like a profile's hero: banner, name, tagline, members, leader. */
export default function ClanHero(props: ClanHeroProps) {
    const { clan, known } = props;

    return (
        <section className='profile-hero clan-hero' aria-labelledby='clan-name'>
            {clan.bannerURL && <img className='profile-hero__banner' src={clan.bannerURL} alt='' />}
            <div className='profile-hero__body'>
                <div className='profile-hero__info'>
                    <p className='clan-hero__eyebrow'>Clan</p>
                    <h1 id='clan-name' className='profile-hero__name'>
                        {clan.name}
                    </h1>
                    {clan.tagline && <p className='profile-hero__title'>{clan.tagline}</p>}
                    <dl className='clan-hero__facts'>
                        <div className='clan-hero__fact'>
                            <dt>Members</dt>
                            <dd>{formatNumber(clan.members)}</dd>
                        </div>
                        <div className='clan-hero__fact'>
                            <dt>HoM players known</dt>
                            <dd>{formatNumber(known)}</dd>
                        </div>
                        {clan.ownerId && clan.ownerName && (
                            <div className='clan-hero__fact'>
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
            </div>
        </section>
    );
}
