import type { ReactNode } from 'react';
import { Link } from '@tanstack/react-router';
// shared: the profile's head to head rows
import '@/features/profile/H2hOpponentRow.scss';
import type { ClanH2hRecord } from '@/types/clan';
import type { SeasonScope } from '@/types/season';
import { formatNumber, plural, timeAgo } from '@/utils/format';
import { formatRate, formatRecord, gamesOf, rateOf, recordTitle } from '@/utils/record';

interface ClanH2hRowProps {
    /** the page's clan */
    clanId: string;
    /** the slot's clan: its id and its name */
    id: string;
    name: string;
    /** the record against it (undefined: never met) */
    row: ClanH2hRecord | undefined;
    /** the games counted: every season, or the live one (undefined) */
    season: SeasonScope | undefined;
    /** "in Season 48", "in any season" */
    scope: string;
    /** the slot's banner and select */
    select: ReactNode;
}

/** One clan slot of the head to head card: the record against it, and a link to those games. */
export default function ClanH2hRow(props: ClanH2hRowProps) {
    const { clanId, id, name, row, season, scope, select } = props;

    const games = gamesOf(row?.record);
    const rate = rateOf(row?.record);

    return (
        <li className='h2h-row'>
            <div className='h2h-row__main clan-h2h-row__main'>
                {select}
                {!row || games === 0 ? (
                    <>
                        <span className='h2h-row__none'>Never met {scope}</span>
                        <span aria-hidden='true' />
                    </>
                ) : (
                    <>
                        <span className='h2h-row__record' title={recordTitle(row.record)}>
                            {formatRecord(row.record)}
                        </span>
                        <span className='h2h-row__track' aria-hidden='true'>
                            <span style={{ inlineSize: `${rate ?? 0}%` }} />
                        </span>
                        <span className='h2h-row__rate'>{formatRate(rate)}</span>
                        <span className='h2h-row__meta'>
                            {formatNumber(games)} {plural(games, 'game')}
                            {row.lastMet && (
                                <span className='h2h-row__last'>{timeAgo(row.lastMet)}</span>
                            )}
                        </span>
                        <Link
                            to='/stats'
                            search={{ season, clan: clanId, clan2: id, view: 'games' }}
                            className='h2h-row__toggle clan-h2h-row__games'
                            title={`Every game against ${name}`}
                            aria-label={`Every game against ${name}`}
                        >
                            →
                        </Link>
                    </>
                )}
            </div>
        </li>
    );
}
