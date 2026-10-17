import { Link } from '@tanstack/react-router';

export default function Header() {
    return (
        <header className='header'>
            <div className='header__inner'>
                <Link to='/' className='header__brand' aria-label='BTDB2 home'>
                    <img src='/bloon_red.png' alt='' />
                    BTDB2
                </Link>
                <nav className='header__nav' aria-label='Main'>
                    <Link
                        to='/leaderboard'
                        className='header__link'
                        activeProps={{ className: 'header__link--active' }}
                        activeOptions={{ includeSearch: false }}
                    >
                        Leaderboard
                    </Link>
                    <Link
                        to='/matches-history'
                        className='header__link'
                        activeProps={{ className: 'header__link--active' }}
                    >
                        Matches
                    </Link>
                </nav>
            </div>
        </header>
    );
}
