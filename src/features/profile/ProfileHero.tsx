import type { UserProfile } from '@/types/profile';
import { formatLabel } from '@/utils/format';
import type { ReactNode } from 'react';

interface ProfileHeroProps {
    profile: UserProfile;
    realName?: string | null | undefined;
    actions?: ReactNode;
}

export default function ProfileHero({ profile, realName, actions }: ProfileHeroProps) {
    const knownAs = realName && realName !== profile.displayName ? realName : null;
    const title =
        profile.equippedTitle && profile.equippedTitle !== 'None' ? profile.equippedTitle : null;

    return (
        <section className='profile-hero' aria-labelledby='profile-name'>
            {profile.equippedBannerURL && (
                <img className='profile-hero__banner' src={profile.equippedBannerURL} alt='' />
            )}
            <div className='profile-hero__body'>
                <div className='profile-hero__avatar'>
                    {profile.equippedAvatarURL && (
                        <img
                            className='profile-hero__avatar-img'
                            src={profile.equippedAvatarURL}
                            alt=''
                        />
                    )}
                    {profile.equippedBorderURL && (
                        <img
                            className='profile-hero__avatar-border'
                            src={profile.equippedBorderURL}
                            alt=''
                        />
                    )}
                </div>
                <div className='profile-hero__info'>
                    <h1 id='profile-name' className='profile-hero__name'>
                        {profile.displayName}
                    </h1>
                    {knownAs && <p className='profile-hero__alias'>Known as {knownAs}</p>}
                    {title && <p className='profile-hero__title'>{formatLabel(title)}</p>}
                    <ul className='profile-hero__badges' aria-label='Badges'>
                        {profile.is_vip && (
                            <li className='profile-hero__badge profile-hero__badge--vip'>VIP</li>
                        )}
                        {profile.is_club_member && (
                            <li className='profile-hero__badge profile-hero__badge--club'>
                                Club member
                            </li>
                        )}
                        {profile.inGuild && <li className='profile-hero__badge'>In a guild</li>}
                    </ul>
                </div>
                {actions && <div className='profile-hero__actions'>{actions}</div>}
            </div>
        </section>
    );
}
