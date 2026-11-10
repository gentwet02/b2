import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import UserAvatar from '@/components/avatar/UserAvatar';
import Panel from '@/components/panel/Panel';
import RecordTable from '@/components/record-table/RecordTable';
import SegmentedControl from '@/components/segmented-control/SegmentedControl';
import { H2H_SCOPES } from '@/config/profile';
// shared: the player cell and the player tables' small-screen rules
import '@/features/compare/CompareMembers.scss';
import type { ClanMember, ClanOverview } from '@/types/clan';
import type { Wld } from '@/types/record';
import { formatNumber, plural, timeAgo } from '@/utils/format';
import { nameWithAlias, playerLabel } from '@/utils/player';
import { byText } from '@/utils/sort';

interface ClanMembersProps {
    /** the members the server knows, best live rank first */
    members: ClanMember[];
    /** every member, as Ninja Kiwi counts them */
    total: number;
    /** each member's record (none yet: 0–0) */
    overview: ClanOverview | undefined;
}

interface MemberRow extends ClanMember {
    record: Wld;
    lastGame: string | null;
}

/** Best rank first, the unranked last. */
const byRank = (a: MemberRow, b: MemberRow) => (a.rank ?? Infinity) - (b.rank ?? Infinity);

/**
 * Every season's rank, best first: the same best rank, then the next best one decides, and so
 * on (two #1 finishes before one; a rank before none).
 */
function byBestRanks(a: MemberRow, b: MemberRow) {
    const seasons = Math.max(a.ranks.length, b.ranks.length);
    for (let i = 0; i < seasons; i++) {
        const diff = (a.ranks[i] ?? Infinity) - (b.ranks[i] ?? Infinity);
        if (diff !== 0) return diff;
    }
    return 0;
}

/**
 * The clan's known members: their rank, score and record this season, or their best rank,
 * best score and record in every season.
 */
export default function ClanMembers(props: ClanMembersProps) {
    const { members, total, overview } = props;

    const [allSeasons, setAllSeasons] = useState(false);
    const rankOrder = allSeasons ? byBestRanks : byRank;
    const records = new Map((overview?.members ?? []).map((m) => [m.userId, m]));
    const rows: MemberRow[] = members
        .map((m) => {
            const games = records.get(m.userId);
            return {
                ...m,
                // all seasons: the best ones
                rank: allSeasons ? m.bestRank : m.rank,
                score: allSeasons ? m.bestScore : m.score,
                record: (allSeasons ? games?.all : games?.season) ?? [0, 0, 0],
                lastGame: games?.lastGame ?? null,
            };
        })
        // best rank of the scope first (the unranked last, as the server listed them)
        .sort(rankOrder);
    const known = `${formatNumber(members.length)} HoM ${plural(members.length, 'player')} known`;

    return (
        <Panel
            title='Members'
            note={`${known}, of ${formatNumber(total)} ${plural(total, 'member')}`}
            actions={
                <SegmentedControl
                    aria-label='Games counted'
                    options={H2H_SCOPES}
                    value={allSeasons ? 'all' : 'season'}
                    onChange={(value) => setAllSeasons(value === 'all')}
                />
            }
        >
            <RecordTable<MemberRow>
                className='compare-members__table'
                rows={rows}
                rowKey={(m) => m.userId}
                empty='No member of this clan is a HoM player we know.'
                initialSort='none'
                label={{
                    title: 'Player',
                    sort: byText((m) => playerLabel(m)),
                    render: (m) => (
                        <span className='opponent-cell'>
                            <UserAvatar id={m.userId} name={playerLabel(m)} size={28} />
                            <span className='opponent-cell__text'>
                                <Link
                                    to='/user/$userId'
                                    params={{ userId: m.userId }}
                                    className='opponent-cell__name'
                                    title={playerLabel(m)}
                                >
                                    {nameWithAlias(m)}
                                </Link>
                                <span className='opponent-cell__last'>
                                    {timeAgo(m.lastGame) ?? '–'}
                                </span>
                            </span>
                        </span>
                    ),
                }}
                columns={[
                    {
                        title: allSeasons ? 'Best rank' : 'Rank',
                        numeric: true,
                        render: (m) => (m.rank === null ? '–' : `#${formatNumber(m.rank)}`),
                        sort: rankOrder,
                    },
                    {
                        title: allSeasons ? 'Best score' : 'Score',
                        numeric: true,
                        render: (m) => (m.score === null ? '–' : formatNumber(m.score)),
                        sort: (a, b) => (b.score ?? -1) - (a.score ?? -1),
                    },
                ]}
                after={[
                    {
                        title: 'Last game',
                        className: 'opponent-last-met',
                        render: (m) => (
                            <span className='record-table__soft'>{timeAgo(m.lastGame) ?? '–'}</span>
                        ),
                    },
                    {
                        title: '',
                        render: (m) => (
                            <Link
                                to='/stats'
                                search={{ player: m.userId }}
                                className='drill-link'
                                aria-label={`Stats of ${playerLabel(m)}`}
                            >
                                <span className='drill-link__text'>Stats </span>→
                            </Link>
                        ),
                    },
                ]}
            />
        </Panel>
    );
}
