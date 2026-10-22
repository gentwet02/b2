import { Link } from '@tanstack/react-router';
import UserAvatar from '@/components/avatar/UserAvatar';
import Panel from '@/components/panel/Panel';
import Note from '@/components/text/Note';
import type { Versus } from '@/types/compare';
import { formatNumber, plural, timeAgo } from '@/utils/format';
import { playerLabel } from '@/utils/player';
import { formatRecord, gamesOf, recordTitle } from '@/utils/record';
import { inScope, seasonTitle } from '@/utils/season';
import { rangeTitle } from '@/utils/versusTitles';
import H2hHighlights from './H2hHighlights';
import H2hSummary from './H2hSummary';

interface VersusSummaryProps {
    data: Versus;
    /** the profile player */
    name: string;
}

/** The record against the opponent (or the range), and its best and worst maps and loadouts. */
export default function VersusSummary(props: VersusSummaryProps) {
    const { data, name } = props;

    const { total } = data;
    const games = gamesOf(total.record);
    const opponent = data.mode === 'player' ? data.opponents[0] : undefined;
    const met = data.opponents.filter((o) => gamesOf(o.record) > 0).length;
    const bounds = data.season === 'all' ? null : (data.seasons[0]?.bounds ?? null);
    const missing = data.missingSeasons.length;

    return (
        <Panel
            title={
                opponent ? (
                    <>
                        <UserAvatar id={data.userId} name={name} size={40} />
                        <span>{name}</span>
                        <span className='versus-title__vs'>vs</span>
                        <UserAvatar id={opponent.userId} name={playerLabel(opponent)} size={40} />
                        <Link to='/user/$userId' params={{ userId: opponent.userId }}>
                            {playerLabel(opponent)}
                        </Link>
                    </>
                ) : (
                    rangeTitle(data, bounds)
                )
            }
            {...(opponent && { titleClassName: 'versus-title' })}
            note={
                opponent?.rank != null
                    ? `${data.season === 'all' ? 'Best rank' : 'Rank'} #${opponent.rank}`
                    : undefined
            }
        >
            {data.mode === 'top' && (
                <Note>
                    {bounds
                        ? `Ranks ${formatNumber(bounds.from)}–${formatNumber(bounds.to)} of the ${formatNumber(bounds.size)} players in ${seasonTitle(data.seasonName)}'s leaderboard.`
                        : 'Each season counts its own players in this range: the games of a season against that season’s ranks.'}
                    {missing > 0 &&
                        ` ${missing} ${plural(missing, 'season is', 'seasons are')} skipped, their leaderboard isn't loaded yet.`}
                </Note>
            )}

            <H2hSummary record={total.record}>
                {games === 0 ? (
                    <>No recorded game {inScope(data)}.</>
                ) : (
                    <>
                        <strong title={recordTitle(total.record)}>
                            {formatRecord(total.record)}
                        </strong>{' '}
                        in {formatNumber(games)} {plural(games, 'game')}
                        {data.mode === 'top' && `, met ${met} of ${data.opponents.length} players`}
                        {total.lastMet && `, last ${timeAgo(total.lastMet)}`}
                    </>
                )}
            </H2hSummary>

            {games > 0 && (
                <H2hHighlights
                    summary={total}
                    labels={data.labels}
                    min={data.mode === 'player' ? data.minGames.opponent : data.minGames.total}
                />
            )}
        </Panel>
    );
}
