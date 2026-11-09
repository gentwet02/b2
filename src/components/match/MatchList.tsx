import { useEffect, useMemo, useRef } from 'react';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import {
    MATCH_LIST_END_THRESHOLD,
    MATCH_LIST_OVERSCAN,
    MATCH_LIST_ROW_ESTIMATE,
} from '@/config/match';
import useKeepSide from '@/hooks/useKeepSide';
import useScrollMargin from '@/hooks/useScrollMargin';
import type { Match, MatchPick } from '@/types/match';
import { cx } from '@/utils/className';
import { matchKey, uniqueMatches } from '@/utils/match';
import { virtualWindow } from '@/utils/virtual';
import MatchCard from './MatchCard';

interface MatchListProps {
    matches: Match[];
    /** the profile being viewed: each card shows its result, and with "keep side" it goes left */
    perspectiveId?: string | undefined;
    /** hero, towers and map become buttons that filter on them */
    onPick?: ((pick: MatchPick) => void) | undefined;
    className?: string;
    /** say which season each match was recorded in (lists spanning several seasons) */
    showSeason?: boolean;
    /** the end of the list scrolled near: load the next page (none: nothing more to load) */
    onEnd?: (() => void) | undefined;
}

/** Match cards, only the ones near the viewport rendered; the window scrolls through them all. */
export default function MatchList(props: MatchListProps) {
    const { perspectiveId, onPick, className, showSeason, onEnd } = props;
    const keepSide = useKeepSide();
    // a key twice and React leaves stale cards behind as the window moves
    const matches = useMemo(() => uniqueMatches(props.matches), [props.matches]);

    const listRef = useRef<HTMLUListElement>(null);
    const margin = useScrollMargin(listRef);
    const virtualizer = useWindowVirtualizer({
        count: matches.length,
        estimateSize: () => MATCH_LIST_ROW_ESTIMATE,
        overscan: MATCH_LIST_OVERSCAN,
        scrollMargin: margin,
        // a card keeps its measured height when new matches come in above it
        getItemKey: (i) => matchKey(matches[i]!),
    });

    const { items, before, after } = virtualWindow(virtualizer);
    const lastIndex = items[items.length - 1]?.index ?? -1;

    useEffect(() => {
        if (onEnd && lastIndex >= matches.length - MATCH_LIST_END_THRESHOLD) onEnd();
    }, [onEnd, lastIndex, matches.length]);

    return (
        <ul
            ref={listRef}
            className={cx('match-list', className)}
            style={{ paddingBlock: `${before}px ${after}px` }}
        >
            {items.map((item) => {
                const match = matches[item.index]!;
                return (
                    <li key={item.key} ref={virtualizer.measureElement} data-index={item.index}>
                        <MatchCard
                            match={match}
                            perspectiveId={perspectiveId}
                            keepSide={keepSide}
                            onPick={onPick}
                            showSeason={showSeason}
                        />
                    </li>
                );
            })}
        </ul>
    );
}
