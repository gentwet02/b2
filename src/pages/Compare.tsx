import MatchCard from '@/components/match/MatchCard';
import { ErrorState, Loading } from '@/components/status/Status';
import H2hHighlights from '@/features/compare/H2hHighlights';
import { Avatar, LoadoutLabel, MapLabel } from '@/features/compare/Labels';
import RecordTable from '@/features/compare/RecordTable';
import VersusControls from '@/features/compare/VersusControls';
import { COMPARE_RANGE_DEFAULT, previousRange, rangeLabel } from '@/config/compare';
import useOpponentsMet from '@/hooks/useOpponentsMet';
import useSplitMaps from '@/hooks/useSplitMaps';
import useVersus from '@/hooks/useVersus';
import type { CompareSearch, Versus, VersusOpponent } from '@/types/compare';
import {
    formatLoadout,
    formatRate,
    formatRecord,
    gamesOf,
    inScope,
    mergeMapVersions,
    pickList,
    playerLabel,
    rateOf,
    recordTitle,
    byText,
} from '@/utils/compare';
import { formatMap, formatNumber, getAlias, seasonTitle, timeAgo } from '@/utils/format';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useMemo, useState } from 'react';

const routeApi = getRouteApi('/user/$userId/compare');

const lower = (label: string) => label.replace('Top', 'top').replace('All', 'all');

function rangeTitle(data: Versus, bounds: Versus['seasons'][number]['bounds']) {
    const range = data.range ?? COMPARE_RANGE_DEFAULT;
    const where = data.season === 'all' ? 'each season' : seasonTitle(data.seasonName);
    if (data.band && bounds) return `Against ranks ${bounds.from}–${bounds.to} of ${where}`;
    const label = lower(rangeLabel(range));
    if (data.band) {
        const previous = previousRange(range);
        return `Against the ${label} without the ${lower(previous?.label ?? '')}, in each season`;
    }
    return range === 'all'
        ? `Against all HoM players of ${where}`
        : `Against the ${label} of ${where}`;
}

function Summary({ data, name }: { data: Versus; name: string }) {
    const { total } = data;
    const games = gamesOf(total.record);
    const opponent = data.mode === 'player' ? data.opponents[0] : undefined;
    const met = data.opponents.filter((o) => gamesOf(o.record) > 0).length;

    const bounds = data.season === 'all' ? null : (data.seasons[0]?.bounds ?? null);
    const title = opponent ? `${name} vs ${playerLabel(opponent)}` : rangeTitle(data, bounds);

    return (
        <section className='profile-panel'>
            <div className='profile-panel__head'>
                {opponent ? (
                    <h2 className='profile-panel__title versus-title'>
                        <Avatar id={data.userId} name={name} size={40} />
                        <span>{name}</span>
                        <span className='versus-title__vs'>vs</span>
                        <Avatar id={opponent.userId} name={playerLabel(opponent)} size={40} />
                        <Link to='/user/$userId' params={{ userId: opponent.userId }}>
                            {playerLabel(opponent)}
                        </Link>
                    </h2>
                ) : (
                    <h2 className='profile-panel__title'>{title}</h2>
                )}
                {opponent?.rank != null && (
                    <span className='profile-panel__note'>
                        {data.season === 'all' ? 'Best rank' : 'Rank'} #{opponent.rank}
                    </span>
                )}
            </div>

            {data.mode === 'top' && (
                <p className='versus-note'>
                    {bounds
                        ? `Ranks ${formatNumber(bounds.from)}–${formatNumber(bounds.to)} of the ${formatNumber(bounds.size)} players in ${seasonTitle(data.seasonName)}'s leaderboard.`
                        : 'Each season counts its own players in this range: the games of a season against that season’s ranks.'}
                    {data.missingSeasons.length > 0 &&
                        ` ${data.missingSeasons.length} season${data.missingSeasons.length > 1 ? 's are' : ' is'} skipped, their leaderboard isn't loaded yet.`}
                </p>
            )}

            <div className='h2h-summary'>
                <span className='h2h-summary__rate'>{formatRate(rateOf(total.record))}</span>
                <span className='h2h-summary__text'>
                    {games === 0 ? (
                        <>No recorded game {inScope(data)}.</>
                    ) : (
                        <>
                            <strong title={recordTitle(total.record)}>
                                {formatRecord(total.record)}
                            </strong>{' '}
                            in {formatNumber(games)} {games === 1 ? 'game' : 'games'}
                            {data.mode === 'top' &&
                                `, met ${met} of ${data.opponents.length} players`}
                            {total.lastMet && `, last ${timeAgo(total.lastMet)}`}
                        </>
                    )}
                </span>
            </div>

            {games > 0 && (
                <H2hHighlights
                    summary={total}
                    labels={data.labels}
                    min={data.mode === 'player' ? data.minGames.opponent : data.minGames.total}
                />
            )}
        </section>
    );
}

function OpponentsSection({ data, search }: { data: Versus; search: CompareSearch }) {
    const [showAll, setShowAll] = useState(false);
    const all = data.season === 'all';
    const neverMet = data.opponents.filter((o) => gamesOf(o.record) === 0).length;
    const rows = showAll ? data.opponents : data.opponents.filter((o) => gamesOf(o.record) > 0);

    return (
        <section className='profile-panel'>
            <div className='profile-panel__head'>
                <h2 className='profile-panel__title'>Opponents</h2>
                {neverMet > 0 && (
                    <button
                        type='button'
                        className='text-link versus-link-button'
                        onClick={() => setShowAll(!showAll)}
                    >
                        {showAll ? 'Hide' : 'Show'} the {neverMet} never met
                    </button>
                )}
            </div>
            <RecordTable<VersusOpponent>
                rows={rows}
                rowKey={(o) => o.userId}
                empty={`No game against these players ${inScope(data)}.`}
                label={{
                    title: 'Player',
                    sort: byText((o) => playerLabel(o)),
                    render: (o) => (
                        <span className='cmp-player'>
                            <Avatar id={o.userId} name={playerLabel(o)} size={28} />
                            <Link
                                to='/user/$userId'
                                params={{ userId: o.userId }}
                                className='cmp-player__name'
                                title={playerLabel(o)}
                            >
                                {o.name}
                                {getAlias(o) && `(${getAlias(o)})`}
                            </Link>
                        </span>
                    ),
                }}
                columns={[
                    {
                        title: all ? 'Best rank' : 'Rank',
                        numeric: true,
                        render: (o) => (o.rank === null ? '–' : `#${o.rank}`),
                        sort: (a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity),
                    },
                    ...(all
                        ? [
                              {
                                  title: `Seasons in range`,
                                  numeric: true,
                                  render: (o: VersusOpponent) => o.seasons,
                                  sort: (a: VersusOpponent, b: VersusOpponent) =>
                                      b.seasons - a.seasons,
                              },
                          ]
                        : []),
                ]}
                after={[
                    {
                        title: 'Last met',
                        render: (o) => (
                            <span className='cmp-table__soft'>{timeAgo(o.lastMet) ?? '–'}</span>
                        ),
                    },
                    {
                        title: '',
                        render: (o) => (
                            <Link
                                from='/user/$userId/compare'
                                search={{ season: search.season, vs: o.userId }}
                                className='versus-drill'
                            >
                                Head to head →
                            </Link>
                        ),
                    },
                ]}
                pageSize={100}
            />
        </section>
    );
}

function SeasonsSection({ data }: { data: Versus }) {
    const rows = data.seasons.filter((s) => gamesOf(s.record) > 0);
    if (data.season !== 'all' || rows.length < 2) return null;
    return (
        <section className='profile-panel'>
            <div className='profile-panel__head'>
                <h2 className='profile-panel__title'>By season</h2>
            </div>
            <RecordTable
                rows={rows}
                rowKey={(s) => String(s.seasonId)}
                label={{
                    title: 'Season',
                    render: (s) => seasonTitle(s.name),
                    sort: (a, b) => a.seasonId - b.seasonId,
                }}
                initialSort='none'
                columns={
                    data.mode === 'top'
                        ? [
                              {
                                  title: 'Ranks',
                                  numeric: true,
                                  render: (s) =>
                                      s.bounds
                                          ? `${formatNumber(s.bounds.from)}–${formatNumber(s.bounds.to)}`
                                          : '–',
                              },
                          ]
                        : []
                }
                after={[
                    {
                        title: 'Last met',
                        render: (s) => (
                            <span className='cmp-table__soft'>{timeAgo(s.lastMet) ?? '–'}</span>
                        ),
                    },
                ]}
            />
        </section>
    );
}

function MapsSection({ data }: { data: Versus }) {
    const [split, setSplit] = useSplitMaps();
    const merged = useMemo(
        () => mergeMapVersions(data.total.maps, data.labels),
        [data.total.maps, data.labels],
    );
    const together = merged.hasReversed && !split;
    const rows = together ? pickList(merged.maps) : data.total.mapList;
    const labels = together ? merged.labels : data.labels;
    return (
        <section className='profile-panel'>
            <div className='profile-panel__head'>
                <h2 className='profile-panel__title'>Maps</h2>
                {merged.hasReversed && (
                    <label className='h2h-highlights__split'>
                        <input
                            type='checkbox'
                            checked={split}
                            onChange={(event) => setSplit(event.target.checked)}
                        />
                        Split reversed maps
                    </label>
                )}
            </div>
            <RecordTable
                rows={rows}
                rowKey={(m) => m.key}
                label={{
                    title: 'Map',
                    render: (m) => <MapLabel mapKey={m.key} labels={labels} />,
                    sort: byText((m) => formatMap(labels.maps[m.key]?.map ?? m.key)),
                }}
            />
        </section>
    );
}

const loadoutName = (key: string) => {
    const { hero, towers } = formatLoadout(key);
    return `${hero} ${towers}`;
};

function LoadoutsSection({ data, name }: { data: Versus; name: string }) {
    const opponent = data.mode === 'player' ? data.opponents[0] : undefined;
    const them = opponent ? playerLabel(opponent) : 'them';
    return (
        <div className='versus-pair'>
            <section className='profile-panel'>
                <div className='profile-panel__head'>
                    <h2 className='profile-panel__title'>{name}&rsquo;s loadouts</h2>
                    <span className='profile-panel__note'>Record with each</span>
                </div>
                <RecordTable
                    rows={data.total.mine}
                    rowKey={(l) => l.key}
                    label={{
                        title: 'Loadout',
                        render: (l) => <LoadoutLabel loadoutKey={l.key} labels={data.labels} />,
                        sort: byText((l) => loadoutName(l.key)),
                    }}
                />
            </section>
            <section className='profile-panel'>
                <div className='profile-panel__head'>
                    <h2 className='profile-panel__title'>
                        {opponent ? `${them}’s loadouts` : 'Their loadouts'}
                    </h2>
                    <span className='profile-panel__note'>{name}&rsquo;s record against each</span>
                </div>
                <RecordTable
                    rows={data.total.theirs}
                    rowKey={(l) => l.key}
                    label={{
                        title: 'Loadout',
                        render: (l) => <LoadoutLabel loadoutKey={l.key} labels={data.labels} />,
                        sort: byText((l) => loadoutName(l.key)),
                    }}
                />
            </section>
        </div>
    );
}

function MatchesSection({ data }: { data: Versus }) {
    if (!data.matches?.length) return null;
    return (
        <section className='profile-panel profile-panel--matches'>
            <div className='profile-panel__head'>
                <h2 className='profile-panel__title'>Their games</h2>
                <span className='profile-panel__note'>
                    {data.matches.length === 30 ? 'The latest 30' : 'Newest first'}
                </span>
            </div>
            <ul className='recent-matches'>
                {data.matches.map((match) => (
                    <li key={match.id}>
                        <MatchCard match={match} perspectiveId={data.userId} />
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default function Compare() {
    const { userId } = routeApi.useParams();
    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    const [pickingPlayer, setPickingPlayer] = useState(false);
    const met = useOpponentsMet(userId, search.season);

    const playerMode = !!search.vs || pickingPlayer;
    const range = search.range ?? COMPARE_RANGE_DEFAULT;
    const band = !!search.band;
    const { data, isLoading, error, refetch, isPlaceholderData } = useVersus(
        userId,
        { season: search.season, vs: search.vs, range, band },
        !playerMode || !!search.vs,
    );

    const update = (next: CompareSearch) => {
        if ('vs' in next && !next.vs) setPickingPlayer(false);
        void navigate({
            search: (prev) => {
                const merged = { ...prev, ...next };
                const customRange =
                    !merged.vs && merged.range && merged.range !== COMPARE_RANGE_DEFAULT;
                return {
                    season: merged.season,
                    vs: merged.vs,
                    range: customRange ? merged.range : undefined,
                    band: customRange && merged.band ? true : undefined,
                };
            },
            replace: true,
            resetScroll: false,
        });
    };
    const choosePlayerMode = () => {
        const first = met.data?.[0]?.userId;
        if (first) update({ vs: first });
        else setPickingPlayer(true);
    };

    const name = data ? playerLabel(data, 'This player') : 'This player';
    const shown = data && (!playerMode || data.mode === 'player') ? data : undefined;
    const hasGames = !!shown && gamesOf(shown.total.record) > 0;

    return (
        <main className='page compare'>
            <div className='page__head'>
                <div>
                    <h1 className='page__title'>{name}, head to head</h1>
                    <p className='page__subtitle'>
                        Only the games {name} played against these players.
                    </p>
                </div>
                <div className='page__actions'>
                    <Link to='/user/$userId' params={{ userId }} className='button button--quiet'>
                        Back to profile
                    </Link>
                </div>
            </div>

            <section className='profile-panel'>
                <VersusControls
                    userId={userId}
                    playerMode={playerMode}
                    vs={search.vs}
                    range={range}
                    band={band}
                    season={search.season}
                    vsName={
                        shown?.mode === 'player' && shown.opponents[0]
                            ? shown.opponents[0].name
                            : undefined
                    }
                    vsAlias={
                        shown?.mode === 'player' && shown.opponents[0]
                            ? getAlias(shown.opponents[0])
                            : undefined
                    }
                    onChange={update}
                    onPlayerMode={choosePlayerMode}
                />
            </section>

            {playerMode && !search.vs ? (
                <p className='profile-panel__empty versus-prompt'>
                    Pick a player above to see every game between them.
                </p>
            ) : isLoading ? (
                <Loading label='Looking up the games…' />
            ) : error || !data ? (
                <ErrorState error={error} onRetry={() => refetch()} />
            ) : shown ? (
                <div className={`versus${isPlaceholderData ? ' versus--updating' : ''}`}>
                    <Summary data={shown} name={name} />
                    {shown.mode === 'top' && <OpponentsSection data={shown} search={search} />}
                    {hasGames && (
                        <>
                            <SeasonsSection data={shown} />
                            <MapsSection data={shown} />
                            <LoadoutsSection data={shown} name={name} />
                            <MatchesSection data={shown} />
                        </>
                    )}
                </div>
            ) : (
                <Loading label='Looking up the games…' />
            )}
        </main>
    );
}
