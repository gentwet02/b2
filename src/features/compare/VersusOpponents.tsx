import { Link } from '@tanstack/react-router';
import { useState } from 'react';
import UserAvatar from '@/components/avatar/UserAvatar';
import Panel from '@/components/panel/Panel';
import RecordTable from '@/components/record-table/RecordTable';
import { COMPARE_OPPONENTS_PAGE_SIZE } from '@/config/compare';
import type { CompareSearch, Versus, VersusOpponent } from '@/types/compare';
import { formatNumber, timeAgo } from '@/utils/format';
import { nameWithAlias, playerLabel } from '@/utils/player';
import { gamesOf } from '@/utils/record';
import { inScope } from '@/utils/season';
import { byText } from '@/utils/sort';

interface VersusOpponentsProps {
    data: Versus;
    search: CompareSearch;
}

/** Range mode: the record against each player of the range. */
export default function VersusOpponents(props: VersusOpponentsProps) {
    const { data, search } = props;

    const [showAll, setShowAll] = useState(false);
    const all = data.season === 'all';
    const neverMet = data.opponents.filter((o) => gamesOf(o.record) === 0).length;
    const rows = showAll ? data.opponents : data.opponents.filter((o) => gamesOf(o.record) > 0);

    return (
        <Panel
            title='Opponents'
            actions={
                neverMet > 0 && (
                    <button
                        type='button'
                        className='text-link'
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Hide' : 'Show'} the {formatNumber(neverMet)} never met
                    </button>
                )
            }
        >
            <RecordTable<VersusOpponent>
                rows={rows}
                rowKey={(o) => o.userId}
                empty={`No game against these players ${inScope(data)}.`}
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
                                  render: (o: VersusOpponent) => formatNumber(o.seasons),
                                  sort: (a: VersusOpponent, b: VersusOpponent) =>
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
                            <Link
                                from='/user/$userId/compare'
                                search={{ season: search.season, vs: o.userId }}
                                className='drill-link'
                                aria-label={`Head to head against ${playerLabel(o)}`}
                            >
                                <span className='drill-link__text'>Head to head </span>→
                            </Link>
                        ),
                    },
                ]}
                pageSize={COMPARE_OPPONENTS_PAGE_SIZE}
            />
        </Panel>
    );
}
