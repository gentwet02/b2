import { Link } from '@tanstack/react-router';

export default function Header() {
    return (
        <header className='header'>
            <nav className='header__nav'>
                <Link to='/'>home</Link>
                <Link to='/user'>profile</Link>
            </nav>
        </header>
    );
}
