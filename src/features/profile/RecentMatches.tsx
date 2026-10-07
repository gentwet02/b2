import MatchCard from '@/components/match/MatchCard';
import { ErrorState, Loading } from '@/components/status/Status';
import useUserMatches from '@/hooks/useUserMatches';
import { extractUserId } from '@/utils/format';
import { useState } from 'react';

const PAGE = 5;

export default function RecentMatches({ userId }: { userId: string }) {
    const { data: matches = [], isLoading, error, refetch } = useUserMatches(userId);
    const [shown, setShown] = useState(PAGE);

    const wins = matches.filter((m) => {
        const me = extractUserId(m.playerLeft.profileURL) === userId ? m.playerLeft : m.playerRight;
        return me.result === 'win';
    }).length;

    return (
        <section className='profile-panel profile-panel--matches'>
            <div className='profile-panel__head'>
                <h2 className='profile-panel__title'>Recent matches</h2>
                {matches.length > 0 && (
                    <span className='profile-panel__note'>
                        {wins} of the last {matches.length} won
                    </span>
                )}
            </div>
            {isLoading && <Loading label='Loading matches…' />}
            {error && <ErrorState error={error} onRetry={() => refetch()} />}
            {!isLoading && !error && matches.length === 0 && (
                <p className='profile-panel__empty'>No recent matches on record.</p>
            )}
            {matches.length > 0 && (
                <ul className='recent-matches'>
                    {matches.slice(0, shown).map((match) => (
                        <li key={match.id}>
                            <MatchCard match={match} perspectiveId={userId} />
                        </li>
                    ))}
                </ul>
            )}
            {matches.length > shown && (
                <button
                    type='button'
                    className='button button--quiet recent-matches__more'
                    onClick={() => setShown((n) => n + PAGE)}
                >
                    Show {Math.min(PAGE, matches.length - shown)} more
                </button>
            )}
        </section>
    );
}
