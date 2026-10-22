import type { ReactNode } from 'react';
import './ProfileHero.scss';

interface ProfileHeroPlaceholderProps {
    /** from a leaderboard already loaded */
    name?: string | undefined;
    children?: ReactNode;
}

/** Same footprint as the real hero, shown while the profile loads. */
export default function ProfileHeroPlaceholder(props: ProfileHeroPlaceholderProps) {
    const { name, children } = props;

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
