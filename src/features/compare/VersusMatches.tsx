import type { ReactNode } from 'react';
import MatchList from '@/components/match/MatchList';
import Panel from '@/components/panel/Panel';
import PanelEmpty from '@/components/panel/PanelEmpty';
import ErrorState from '@/components/status/ErrorState';
import Loading from '@/components/status/Loading';
import ControlCheckbox from '@/components/controls/ControlCheckbox';
import { MATCH_SORT_LABELS } from '@/config/match';
import useCompareGames from '@/hooks/queries/useCompareGames';
import useKeepSide, { setKeepSide } from '@/hooks/useKeepSide';
import type { CompareParams } from '@/services/api/compare';
import type { Comparison } from '@/types/compare';
import type { MatchSort } from '@/types/match';
import { formatNumber, lowerFirst, plural } from '@/utils/format';

interface VersusMatchesProps {
    data: Comparison;
    /** the sides and filters, as for the comparison */
    params: CompareParams;
    sort: MatchSort;
    /** the stats tabs (and the sort), in the head */
    tabs?: ReactNode;
    /** what the filters keep, after the note */
    focus?: string[] | undefined;
}

/** A player on a side: the games between the sides, sorted, more on demand. */
export default function VersusMatches(props: VersusMatchesProps) {
    const { data, params, sort, tabs, focus = [] } = props;

    const games = useCompareGames(params, sort);
    const pages = games.data?.pages ?? [];
    const matches = pages.flatMap((p) => p.items);
    const total = pages[0]?.total ?? 0;
    const remaining = total - matches.length;
    const bothPlayers = data.a.mode === 'player' && data.b.mode === 'player';
    const perspectiveId = data.a.userId ?? undefined;
    const keepSide = useKeepSide();
    // only side 1 being a player gives the cards someone to keep on the left
    const keepSideToggle = perspectiveId ? (
        <ControlCheckbox checked={keepSide} onChange={setKeepSide}>
            {bothPlayers ? 'Player 1 on the left' : 'Player on the left'}
        </ControlCheckbox>
    ) : null;

    const note = [
        games.data
            ? `${formatNumber(total)} ${plural(total, 'game')}, ${lowerFirst(MATCH_SORT_LABELS[sort])} first`
            : null,
        ...focus,
    ]
        .filter(Boolean)
        .join(' · ');

    return (
        <Panel
            {...(tabs
                ? {
                      headClassName: 'stats-results__head',
                      actions: (
                          <>
                              {tabs}
                              {keepSideToggle}
                              {note && <span className='panel__note'>{note}</span>}
                          </>
                      ),
                  }
                : {
                      title: bothPlayers ? 'Their games' : 'Latest games',
                      note,
                      actions: keepSideToggle,
                  })}
        >
            {games.isLoading ? (
                <Loading label='Looking up the games…' />
            ) : games.error ? (
                <ErrorState error={games.error} onRetry={() => games.refetch()} />
            ) : matches.length === 0 ? (
                <PanelEmpty>No recorded game between them.</PanelEmpty>
            ) : (
                <>
                    <MatchList
                        matches={matches}
                        perspectiveId={perspectiveId}
                        showSeason={data.season === 'all'}
                    />
                    {remaining > 0 && (
                        <div className='versus-matches__more'>
                            <button
                                type='button'
                                className='button--quiet'
                                onClick={() => games.fetchNextPage()}
                                disabled={games.isFetchingNextPage}
                            >
                                {games.isFetchingNextPage
                                    ? 'Loading…'
                                    : `Show ${formatNumber(Math.min(pages.at(-1)?.limit ?? 30, remaining))} more`}
                            </button>
                        </div>
                    )}
                </>
            )}
        </Panel>
    );
}
