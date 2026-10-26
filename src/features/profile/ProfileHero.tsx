import type { ReactNode } from 'react';
import clubMember from '@/assets/images/club_member.png';
import Medal from '@/components/medal/Medal';
import type { UserProfile } from '@/types/profile';
import { readBadges } from '@/utils/badges';
import { formatLabel } from '@/utils/format';

interface ProfileHeroProps {
    profile: UserProfile;
    alias?: string | null | undefined;
    actions?: ReactNode;
    /** e.g. "Updated 3 minutes ago" */
    note?: string | null;
}

export default function ProfileHero(props: ProfileHeroProps) {
    const { profile, alias, actions, note } = props;

    const badges = readBadges(profile.badges_equipped);
    const knownAs = alias && alias !== profile.displayName ? alias : null;
    const title =
        profile.equippedTitle && profile.equippedTitle !== 'None' ? profile.equippedTitle : null;

    return (
        <section
            className={`profile-hero${profile.equippedBorderURL ? ' profile-hero--framed' : ''}`}
            aria-labelledby='profile-name'
        >
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
                </div>
                <div className='profile-hero__info'>
                    <div className='profile-hero__heading'>
                        <h1 id='profile-name' className='profile-hero__name'>
                            {profile.displayName}
                        </h1>
                        {profile.is_club_member && (
                            <img
                                className='profile-hero__club'
                                src={clubMember}
                                alt='Club member'
                                title='Club member'
                            />
                        )}
                    </div>
                    {knownAs && <p className='profile-hero__alias'>Known as {knownAs}</p>}
                    {title && <p className='profile-hero__title'>{formatLabel(title)}</p>}
                    {badges.length > 0 && (
                        <ul className='profile-hero__equipped' aria-label='Equipped medals'>
                            {badges.map((badge) => (
                                <li key={badge.key} className='profile-hero__equipped-item'>
                                    <Medal badge={badge} size='sm' />
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                {(actions || note) && (
                    <div className='profile-hero__actions'>
                        {note && <span className='profile-hero__note'>{note}</span>}
                        {actions}
                    </div>
                )}
            </div>
        </section>
    );
}
