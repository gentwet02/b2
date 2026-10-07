import { StatusMessage } from '@/components/status/Status';
import { Link } from '@tanstack/react-router';

export default function NotFound() {
    return (
        <main className='page'>
            <StatusMessage
                title='This page popped'
                action={
                    <Link to='/' className='button'>
                        Go to the live leaderboard
                    </Link>
                }
            >
                The address doesn't match any page. Check the link, or start from the leaderboard.
            </StatusMessage>
        </main>
    );
}
