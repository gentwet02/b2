import { Link } from '@tanstack/react-router';
import { useState, type ReactNode } from 'react';
import UserAvatar from '@/components/avatar/UserAvatar';
import Panel from '@/components/panel/Panel';
import RecordTable from '@/components/record-table/RecordTable';
import { COMPARE_OPPONENTS_PAGE_SIZE } from '@/config/compare';
import type { Comparison, CompareMember, CompareSideKey } from '@/types/compare';
import { formatNumber, timeAgo } from '@/utils/format';
import { nameWithAlias, playerLabel } from '@/utils/player';
import { gamesOf } from '@/utils/record';
import { inScope } from '@/utils/season';
import { byText } from '@/utils/sort';

interface CompareMembersProps {
    data: Comparison;
    /** whose players: side 1's (their own record) or side 2's (side 1's record against them) */
    side: CompareSideKey;
    /** shown without a title when there are tabs (the tab names the table) */
    title: string;
    note?: string | undefined;
    /** the stats tabs, in the head */
    tabs?: ReactNode;
    /** players with fewer games left out (the never met ones are shown on demand) */
    min?: number | undefined;
    /** the player alone takes the place of their side */
    onDrill: (side: CompareSideKey, userId: string) => void;
}

/** A range side: the record of (or against) each of its players, each one a drill-down. */
export default function CompareMembers(props: CompareMembersProps) {
    const { data, side, title, note, tabs, min = 1, onDrill } = props;

    const [showAll, setShowAll] = useState(false);
    const all = data.season === 'all';
    const members = side === 'a' ? data.players : data.opponents;
    const neverMet = members.filter((o) => gamesOf(o.record) === 0).length;
    const rows = members.filter((o) => {
        const games = gamesOf(o.record);
        return games >= Math.max(min, 1) || (showAll && games === 0);
    });

    return (
        <Panel
            {...(tabs ? { headClassName: 'stats-results__head' } : { title, note })}
            actions={
                <>
                    {tabs}
                    {/* with tabs: the note under them, not before */}
                    {tabs && note && <span className='panel__note'>{note}</span>}
                    {neverMet > 0 && (
                        <button
                            type='button'
                            className='text-link'
                            onClick={() => setShowAll(!showAll)}
                        >
                            {showAll ? 'Hide' : 'Show'} the {formatNumber(neverMet)} never met
                        </button>
                    )}
                </>
            }
        >
            <RecordTable<CompareMember>
                rows={rows}
                rowKey={(o) => o.userId}
                empty={`No game between these players ${inScope(data)}.`}
                label={{
                    title: 'Player',
                    sort: byText((o) => playerLabel(o)),
                    render: (o) => (
                        <span className='opponent-cell'>
                            <UserAvatar id={o.userId} name={playerLabel(o)} size={28} />
                            <span className='opponent-cell__text'>
                                <Link
                                    to='/user/$userId'
                                    params={{ userId: o.userId }}
                                    className='opponent-cell__name'
                                    title={playerLabel(o)}
                                >
                                    {nameWithAlias(o)}
                                </Link>
                                <span className='opponent-cell__last'>
                                    {timeAgo(o.lastMet) ?? '–'}
                                </span>
                            </span>
                        </span>
                    ),
                }}
                columns={[
                    {
                        title: all ? 'Best rank' : 'Rank',
                        numeric: true,
                        render: (o) => (o.rank === null ? '–' : `#${formatNumber(o.rank)}`),
                        sort: (a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity),
                    },
                    ...(all
                        ? [
                              {
                                  title: 'Seasons in range',
                                  numeric: true,
                                  render: (o: CompareMember) => formatNumber(o.seasons),
                                  sort: (a: CompareMember, b: CompareMember) =>
                                      b.seasons - a.seasons,
                              },
                          ]
                        : []),
                ]}
                after={[
                    {
                        title: 'Last met',
                        className: 'opponent-last-met',
                        render: (o) => (
                            <span className='record-table__soft'>{timeAgo(o.lastMet) ?? '–'}</span>
                        ),
                    },
                    {
                        title: '',
                        render: (o) => (
                            <button
                                type='button'
                                className='drill-link'
                                onClick={() => onDrill(side, o.userId)}
                                aria-label={`Only ${playerLabel(o)}`}
                            >
                                <span className='drill-link__text'>Focus </span>→
                            </button>
                        ),
                    },
                ]}
                pageSize={COMPARE_OPPONENTS_PAGE_SIZE}
            />
        </Panel>
    );
}
