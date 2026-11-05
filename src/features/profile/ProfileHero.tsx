import type { ReactNode } from 'react';
import clubMember from '@/assets/images/club_member.png';
import Medal from '@/components/medal/Medal';
import { PLAYER_TAG_LABELS } from '@/config/player';
import type { PlayerTag } from '@/types/player';
import type { UserProfile } from '@/types/profile';
import { readBadges } from '@/utils/badges';
import { bem } from '@/utils/className';
import { formatLabel } from '@/utils/format';
import { getAlias } from '@/utils/player';
import OldNames from './OldNames';

interface ProfileHeroProps {
    profile: UserProfile;
    alias?: string | null | undefined;
    /** from the server's tag lists: shown as a badge next to the name */
    tag?: PlayerTag | null | undefined;
    /** the names the player went by before, most recently used first */
    oldNames?: string[] | undefined;
    actions?: ReactNode;
    /** e.g. "Updated 3 minutes ago" */
    note?: string | null;
}

export default function ProfileHero(props: ProfileHeroProps) {
    const { profile, alias, tag, oldNames, actions, note } = props;

    const badges = readBadges(profile.badges_equipped);
    const knownAs = getAlias({ alias, displayName: profile.displayName });
    const title =
        profile.equippedTitle && profile.equippedTitle !== 'None' ? profile.equippedTitle : null;

    return (
        <section
            className={bem('profile-hero', !!profile.equippedBorderURL && 'framed')}
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
                        {tag && (
                            <span className={bem('profile-hero__tag', tag)}>
                                {PLAYER_TAG_LABELS[tag]}
                            </span>
                        )}
                    </div>
                    {knownAs && <p className='profile-hero__alias'>Known as {knownAs}</p>}
                    {oldNames && oldNames.length > 0 && <OldNames names={oldNames} />}
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
