import { Link } from '@tanstack/react-router';
import Page from '@/components/page/Page';
import StatusMessage from '@/components/status/StatusMessage';

export default function NotFound() {
    return (
        <Page>
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
        </Page>
    );
}
