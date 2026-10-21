import PlayerAvatar from '@/components/avatar/PlayerAvatar';
import usePlayerAvatars from '@/hooks/usePlayerAvatars';
import { formatNumber, getAlias, winRate } from '@/utils/format';
import { Link } from '@tanstack/react-router';
import type { RankedPlayer } from './LeaderboardScore';

const ORDER = [2, 1, 3];

export default function Podium({
    players,
    avatars: serverAvatars,
    records,
}: {
    players: RankedPlayer[];
    avatars?: Record<string, string> | undefined;
    /** [wins, losses, draws] per player id, from the leaderboard stats */
    records?: Record<string, [number, number, number]> | undefined;
}) {
    const avatars = usePlayerAvatars(serverAvatars);
    const top = ORDER.map((rank) => players[rank - 1]).filter(Boolean);
    if (top.length === 0) return null;

    return (
        <ol className='podium' aria-label='Top three players'>
            {top.map(
                (player) =>
                    player && (
                        <li key={player.id} className={`podium__spot podium__spot--${player.rank}`}>
                            <Link
                                to='/user/$userId'
                                params={{ userId: player.id }}
                                className='podium__player'
                            >
                                <PlayerAvatar
                                    className='podium__avatar'
                                    src={avatars[player.id]}
                                    name={player.name}
                                    size={72}
                                />
                                <span className='podium__name'>{player.name}</span>
                                <span className='podium__alias'>{getAlias(player)}</span>
                                <span className='podium__score'>{formatNumber(player.score)}</span>
                            </Link>
                            <div className='podium__step'>
                                <span aria-hidden='true'>{player.rank}</span>
                                <PodiumStats record={records?.[player.id]} />
                            </div>
                            <span className='visually-hidden'>Rank {player.rank}</span>
                        </li>
                    ),
            )}
        </ol>
    );
}

/** Revealed under the rank number when the step lifts on hover. */
function PodiumStats({ record }: { record?: [number, number, number] | undefined }) {
    const [wins, losses, draws] = record ?? [0, 0, 0];
    const games = wins + losses + draws;
    const rate = winRate(wins, losses);

    return (
        <dl className='podium__stats'>
            <div>
                <dt>{games === 1 ? 'game' : 'games'}</dt>
                <dd>{record ? formatNumber(games) : '–'}</dd>
            </div>
            <div>
                <dt>win rate</dt>
                <dd>{rate === null ? '–' : `${rate.toFixed(1)}%`}</dd>
            </div>
        </dl>
    );
}
