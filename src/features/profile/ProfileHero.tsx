import type { UserProfile } from '@/types/profile';
import { formatLabel } from '@/utils/format';
import type { ReactNode } from 'react';

/** Same footprint as the real hero, shown while the profile loads. */
export function ProfileHeroPlaceholder({
    name,
    children,
}: {
    name?: string;
    children?: ReactNode;
}) {
    return (
        <section className='profile-hero profile-hero--placeholder' aria-busy='true'>
            <div className='profile-hero__banner profile-hero__banner--empty' />
            <div className='profile-hero__body'>
                <div className='profile-hero__avatar'>
                    <span className='profile-hero__avatar-img profile-hero__avatar-img--empty' />
                </div>
                <div className='profile-hero__info'>
                    <h1 className='profile-hero__name'>{name ?? 'Loading profile…'}</h1>
                    {children}
                </div>
            </div>
        </section>
    );
}

interface ProfileHeroProps {
    profile: UserProfile;
    realName?: string | null;
    actions?: ReactNode;
    /** e.g. "Updated 3 minutes ago" */
    note?: string | null;
}

const IMAGE_URL = /^https?:\/\/\S+\.(png|jpe?g|webp|gif|svg)(\?\S*)?$/i;

/**
 * Equipped badges as Ninja Kiwi sends them. Their exact shape isn't documented, so read
 * defensively: an image URL anywhere in the item becomes a picture, otherwise its name.
 */
interface Badge {
    key: string;
    name: string;
    url?: string;
}

function readBadges(raw: unknown[] | undefined): Badge[] {
    return (raw ?? []).flatMap((item, i): Badge[] => {
        if (typeof item === 'string') {
            return IMAGE_URL.test(item)
                ? [{ key: `b${i}`, url: item, name: 'Badge' }]
                : [{ key: `b${i}`, name: formatLabel(item) }];
        }
        if (item && typeof item === 'object') {
            const values = Object.entries(item as Record<string, unknown>);
            const url = values.find(([, v]) => typeof v === 'string' && IMAGE_URL.test(v))?.[1] as
                | string
                | undefined;
            const nameField = values.find(
                ([k, v]) => typeof v === 'string' && /^(name|badge|type|id)$/i.test(k),
            )?.[1] as string | undefined;
            const name = nameField ? formatLabel(nameField) : 'Badge';
            return url || nameField ? [{ key: `b${i}`, url, name }] : [];
        }
        return [];
    });
}

export default function ProfileHero({ profile, realName, actions, note }: ProfileHeroProps) {
    const badges = readBadges(profile.badges_equipped);
    const knownAs = realName && realName !== profile.displayName ? realName : null;
    const title =
        profile.equippedTitle && profile.equippedTitle !== 'None' ? profile.equippedTitle : null;

    return (
        <section
            className={`profile-hero${profile.equippedBorderURL ? ' profile-hero--framed' : ''}`}
            aria-labelledby='profile-name'
        >
            {/* {profile.equippedBorderURL && (
                <img className='profile-hero__frame' src={profile.equippedBorderURL} alt='' />
            )} */}
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
                    {badges.length > 0 && (
                        <ul className='profile-hero__equipped' aria-label='Equipped badges'>
                            {badges.map((badge) => (
                                <li
                                    key={badge.key}
                                    className='profile-hero__equipped-item'
                                    title={badge.name}
                                >
                                    {badge.url ? (
                                        <img src={badge.url} alt={badge.name} />
                                    ) : (
                                        badge.name
                                    )}
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
