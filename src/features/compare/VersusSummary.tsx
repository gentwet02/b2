import { Link } from '@tanstack/react-router';
import type { ReactNode } from 'react';
import UserAvatar from '@/components/avatar/UserAvatar';
import Panel from '@/components/panel/Panel';
import Note from '@/components/text/Note';
import type { Comparison, CompareSideKey } from '@/types/compare';
import {
    groupName,
    sideBounds,
    sideName,
    sidePossessive,
    side2Effective,
    sameSides,
    sidesOverlap,
} from '@/utils/compareTitles';
import { useSplitMaps } from '@/hooks/useSplitVariants';
import { formatNumber, plural, timeAgo } from '@/utils/format';
import { formatRate, formatRecord, gamesOf, rateOf, recordTitle } from '@/utils/record';
import { inScope, seasonTitle } from '@/utils/season';
import H2hHighlights from './H2hHighlights';
import StatsSummaryItem from '@/features/stats/StatsSummaryItem';

interface VersusSummaryProps {
    data: Comparison;
    /** no hero or tower filter on either side (the two sides can then mirror each other) */
    mirrored?: boolean;
    /** in the head: the stats tabs and options */
    actions?: ReactNode;
    headClassName?: string;
}

/** One side in the title: a player (avatar, link to the profile) or the range. */
function SideTitle(props: { data: Comparison; side: CompareSideKey }) {
    const { data, side } = props;
    const name = sideName(data, side);
    const id = data[side].userId;
    if (data[side].mode === 'anyone') return <span>anyone</span>;
    if (!id) return <span>{name}</span>;
    return (
        <>
            <UserAvatar id={id} name={name} size={40} />
            <Link to='/user/$userId' params={{ userId: id }}>
                {name}
            </Link>
        </>
    );
}

/** The record between the sides, and side 1's best and worst maps and loadouts. */
export default function VersusSummary(props: VersusSummaryProps) {
    const { data, actions, headClassName, mirrored } = props;
    const [splitMaps] = useSplitMaps();

    const { total } = data;
    const games = gamesOf(total.record);
    const bothPlayers = data.a.mode === 'player' && data.b.mode === 'player';
    const metA = data.players.filter((o) => gamesOf(o.record) > 0).length;
    const metB = data.opponents.filter((o) => gamesOf(o.record) > 0).length;
    const missing = data.missingSeasons.length;
    const effective = side2Effective(data);
    const where = data.season === 'all' ? null : seasonTitle(data.seasonName);

    const rankOf = (side: CompareSideKey) => {
        const member = (side === 'a' ? data.players : data.opponents)[0];
        return data[side].mode === 'player' && member?.rank != null
            ? `${sideName(data, side)} ${data.season === 'all' ? 'best rank' : 'rank'} #${formatNumber(member.rank)}`
            : null;
    };
    const ranks = [rankOf('a'), rankOf('b')].filter(Boolean).join(' · ');

    // "Top 25 (ranks 1–25)", "ranks 26–569" (side 2 once side 1's players are out), "All HoM players"
    const describe = (side: 'a' | 'b') => {
        const bounds = sideBounds(data, side);
        if (side === 'b' && effective) {
            return `ranks ${formatNumber(effective.from)}–${formatNumber(effective.to)}`;
        }
        const name = groupName(data[side], bounds);
        const whole = bounds && bounds.from === 1 && bounds.to >= bounds.size;
        return bounds && !whole && !name.startsWith('Ranks')
            ? `${name} (ranks ${formatNumber(bounds.from)}–${formatNumber(bounds.to)})`
            : name;
    };
    const groupSides = (['a', 'b'] as const).filter((side) => data[side].mode === 'top');
    const size = groupSides.map((side) => sideBounds(data, side)?.size).find((n) => n != null);
    const shared = sidesOverlap(data);
    const notes = [
        where
            ? `${groupSides.map(describe).join(' vs ')}${size != null ? `, of the ${formatNumber(size)} players in its leaderboard` : ''}.`
            : 'Ranks come from each season’s own leaderboard.',
        shared && data.overlap !== false && 'Shared players count on both sides.',
        shared &&
            data.overlap === false &&
            `Games between two ${sideName(data, 'a')} players aren’t counted.`,
        data.b.mode === 'anyone' &&
            data.a.mode === 'top' &&
            'A game between two of these players counts for both.',
        missing > 0 &&
            `${formatNumber(missing)} ${plural(missing, 'season is', 'seasons are')} skipped, their leaderboard isn’t loaded yet.`,
    ].filter(Boolean);
    const hasGroup = data.a.mode === 'top' || data.b.mode === 'top';
    // the same players on both sides, counted on both, no loadout filter: every map at 50%
    const mirror = !!mirrored && sidesOverlap(data) && data.overlap !== false && sameSides(data);
    const anyone = data.b.mode === 'anyone';

    // like the stats summary: big numbers over their labels
    const items = [
        { value: formatRate(rateOf(total.record)), label: 'Win rate' },
        {
            value: formatRecord(total.record),
            label: `in ${formatNumber(games)} ${plural(games, 'game')}`,
            title: recordTitle(total.record),
        },
        data.a.mode === 'top' && {
            value: formatNumber(metA),
            label: `of ${formatNumber(data.players.length)} players played`,
        },
        data.b.mode === 'top' && {
            value: formatNumber(metB),
            label: `of ${formatNumber(data.opponents.length)} opponents met`,
        },
        total.lastMet && { value: timeAgo(total.lastMet) ?? '–', label: 'Last game' },
    ].filter((item) => !!item);

    return (
        <Panel
            title={
                <>
                    <SideTitle data={data} side='a' />
                    <span className='versus-title__vs'>vs</span>
                    <SideTitle data={data} side='b' />
                </>
            }
            titleClassName='versus-title'
            note={[data.season === 'all' ? data.seasonName : seasonTitle(data.seasonName), ranks]
                .filter(Boolean)
                .join(' · ')}
            actions={actions}
            {...(headClassName && { headClassName })}
        >
            {games === 0 ? (
                <p className='versus-summary__empty'>
                    No recorded game {anyone ? '' : 'between them '}
                    {inScope(data)}.
                </p>
            ) : (
                <div className='stats-summary'>
                    {items.map((item) => (
                        <StatsSummaryItem key={item.label} {...item} />
                    ))}
                </div>
            )}

            {hasGroup && <Note>{notes.join(' ')}</Note>}

            {games > 0 && (
                <H2hHighlights
                    summary={total}
                    labels={data.labels}
                    min={bothPlayers ? data.minGames.opponent : data.minGames.total}
                    names={{ mine: sidePossessive(data, 'a'), theirs: sidePossessive(data, 'b') }}
                    playedMaps={
                        mirror
                            ? ((splitMaps && total.mapVariantList) || total.mapList)
                            : undefined
                    }
                />
            )}
        </Panel>
    );
}
