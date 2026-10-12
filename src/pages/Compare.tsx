import Dropdown from '@/components/dropdown/Dropdown';
import { ErrorState, Loading } from '@/components/status/Status';
import H2hHighlights from '@/features/compare/H2hHighlights';
import {
    H2hLoadoutTable,
    H2hMapGrid,
    H2hRecordTable,
    H2hSlots,
} from '@/features/compare/H2hTables';
import useHeadToHead from '@/hooks/useHeadToHead';
import useOpponentSlots from '@/hooks/useOpponentSlots';
import useSeasons from '@/hooks/useSeasons';
import type { CompareSeason } from '@/types/compare';
import { formatRate, formatRecord, gamesOf, playerLabel, rateOf } from '@/utils/compare';
import { formatNumber, seasonLabel } from '@/utils/format';
import { getRouteApi, Link } from '@tanstack/react-router';

const routeApi = getRouteApi('/user/$userId/compare');

export default function Compare() {
    const { userId } = routeApi.useParams();
    const { season } = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    const seasons = useSeasons();

    const { slots, ids, players, ready, setSlot, reset, hasCustom } = useOpponentSlots(
        userId,
        season,
    );
    const { data, isLoading, error, refetch, isFetching } = useHeadToHead(
        userId,
        ids,
        season,
        ready,
    );

    const liveSeason = seasons.data?.liveSeason;
    const seasonOptions: { value: string; label: string }[] = [
        { value: 'all', label: 'All seasons' },
        ...(seasons.data?.seasons ?? []).map((s) => ({
            value: String(s.id),
            label: `${seasonLabel(s.id)}${s.live ? ' (live)' : ''}`,
        })),
    ];
    const current = season === undefined ? String(liveSeason ?? '') : String(season);
    const setSeason = (value: string) => {
        const next: CompareSeason | undefined =
            value === 'all' ? 'all' : Number(value) === liveSeason ? undefined : Number(value);
        void navigate({ search: { season: next }, replace: true });
    };

    const name = data ? playerLabel(data, 'This player') : 'This player';
    const total = data?.total;

    return (
        <main className='page compare'>
            <div className='page__head'>
                <div>
                    <h1 className='page__title'>{name}, head to head</h1>
                    <p className='page__subtitle'>
                        {season === 'all'
                            ? `Every game ${name} played against each opponent, all seasons together.`
                            : `The games ${name} played against each opponent${data ? ` in ${data.seasonName}` : ''}.`}{' '}
                        Records are from {name}&rsquo;s side.
                    </p>
                </div>
                <div className='page__actions'>
                    {current && (
                        <Dropdown
                            variant='compact'
                            options={seasonOptions}
                            value={current}
                            aria-label='Season'
                            onSelect={setSeason}
                        />
                    )}
                    <Link to='/user/$userId' params={{ userId }} className='button button--quiet'>
                        Back to profile
                    </Link>
                </div>
            </div>

            {isLoading || (!data && !ready) ? (
                <Loading label='Looking up the games…' />
            ) : error || !data || !total ? (
                <ErrorState error={error} onRetry={() => refetch()} />
            ) : (
                <>
                    <section className='profile-panel'>
                        <div className='profile-panel__head'>
                            <h2 className='profile-panel__title'>Opponents</h2>
                            {hasCustom ? (
                                <button
                                    type='button'
                                    className='text-link h2h-card__reset'
                                    onClick={reset}
                                >
                                    Back to the top 10
                                </button>
                            ) : (
                                <span className='profile-panel__note'>
                                    The top 10 by default, replace anyone
                                </span>
                            )}
                        </div>
                        <H2hSlots
                            data={data}
                            userId={userId}
                            slots={slots}
                            players={players}
                            onSlot={setSlot}
                        />
                    </section>

                    <section className='profile-panel'>
                        <div className='profile-panel__head'>
                            <h2 className='profile-panel__title'>Against all of them</h2>
                            {isFetching && <span className='profile-panel__note'>Updating…</span>}
                        </div>
                        <div className='h2h-summary'>
                            <span className='h2h-summary__rate'>
                                {formatRate(rateOf(total.record))}
                            </span>
                            <span className='h2h-summary__text'>
                                <strong>{formatRecord(total.record)}</strong> in{' '}
                                {formatNumber(gamesOf(total.record))} games
                            </span>
                        </div>
                        <H2hHighlights
                            summary={total}
                            labels={data.labels}
                            min={data.minGames.total}
                        />
                    </section>

                    <section className='profile-panel'>
                        <div className='profile-panel__head'>
                            <h2 className='profile-panel__title'>Record</h2>
                            <span className='profile-panel__note'>
                                Best and worst need {data.minGames.opponent}+ games
                            </span>
                        </div>
                        <H2hRecordTable data={data} slots={slots} />
                    </section>

                    <section className='profile-panel'>
                        <div className='profile-panel__head'>
                            <h2 className='profile-panel__title'>Loadouts</h2>
                            <span className='profile-panel__note'>
                                Records are {name}&rsquo;s, with or against that loadout
                            </span>
                        </div>
                        <H2hLoadoutTable data={data} slots={slots} />
                    </section>

                    <section className='profile-panel'>
                        <div className='profile-panel__head'>
                            <h2 className='profile-panel__title'>By map</h2>
                            <span className='profile-panel__note'>
                                {name}&rsquo;s record on each map against each opponent
                            </span>
                        </div>
                        <H2hMapGrid data={data} slots={slots} />
                    </section>
                </>
            )}
        </main>
    );
}
