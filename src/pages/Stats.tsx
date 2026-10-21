import Dropdown from '@/components/dropdown/Dropdown';
import HeroChips from '@/features/match/HeorChips';
import MapChip, { type MapChipOption } from '@/features/match/MapChip';
import TowerChips from '@/features/match/TowerChips';
import { ErrorState, Loading } from '@/components/status/Status';
import { LoadoutLabel, MapLabel } from '@/features/compare/Labels';
import RecordTable from '@/features/compare/RecordTable';
import { previousRange } from '@/config/compare';
import {
    STATS_MAX_TOWERS,
    STATS_MIN_DEFAULT,
    STATS_MIN_GAMES,
    STATS_MIN_PICK,
    STATS_MIN_PICK_DEFAULT,
    STATS_PLAYERS,
    STATS_PLAYERS_DEFAULT,
    STATS_VIEW_DEFAULT,
    STATS_VIEWS,
    statsPlayersLabel,
} from '@/config/stats';
import { useRankedPlayers } from '@/hooks/useRankedPlayers';
import useSeasons from '@/hooks/useSeasons';
import useStats from '@/hooks/useStats';
import type { Stats as StatsData, StatsMapRow, StatsRow, StatsSearch } from '@/types/stats';
import { heroImage } from '@/utils/assetOverrides';
import {
    formatRate,
    formatRecord,
    gamesOf,
    parseLoadout,
    playerLabel,
    rateOf,
    recordTitle,
    byText,
} from '@/utils/compare';
import {
    formatHero,
    formatHeroPick,
    formatLabel,
    formatMap,
    formatNumber,
    getAlias,
    joinList,
    parseHero,
    seasonLabel,
    seasonTitle,
    splitList,
} from '@/utils/format';
import { getRouteApi, Link } from '@tanstack/react-router';
import { useMemo, useState, type ReactNode } from 'react';

const routeApi = getRouteApi('/stats');

const share = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : null);
const formatShare = (value: number | null) =>
    value === null
        ? '–'
        : value >= 10 || value === 0
          ? `${value.toFixed(0)}%`
          : `${value.toFixed(1)}%`;

function HeroLabel({ base, labels }: { base: string; labels: StatsData['labels'] }) {
    const label = labels.heroes[base];
    const src = heroImage(label?.hero ?? base, label?.portrait ?? undefined);
    return (
        <span className='cmp-label'>
            {src ? (
                <img className='cmp-label__hero' src={src} alt='' loading='lazy' />
            ) : (
                <span className='cmp-label__hero cmp-label__hero--empty' aria-hidden='true' />
            )}
            <span className='cmp-label__text'>{formatHero(base)}</span>
        </span>
    );
}

function VariantLabel({ hero, labels }: { hero: string; labels: StatsData['labels'] }) {
    const label = labels.variants[hero];
    const base = label?.base ?? hero;
    const src = heroImage(hero, label?.portrait ?? undefined);
    return (
        <span className='cmp-label'>
            {src ? (
                <img className='cmp-label__hero' src={src} alt='' loading='lazy' />
            ) : (
                <span className='cmp-label__hero cmp-label__hero--empty' aria-hidden='true' />
            )}
            <span className='cmp-label__text'>
                {formatHero(hero)}
                {hero === base && <span className='cmp-label__sub'>Classic</span>}
            </span>
        </span>
    );
}

/** Who is counted, in words: "the top 25 of Season 47", "Bob", "every player". */
function groupTitle(data: StatsData) {
    const where = data.season === 'all' ? 'every season' : seasonTitle(data.seasonName);
    if (data.mode === 'player' && data.player) return `${playerLabel(data.player)} in ${where}`;
    const range = data.players ?? STATS_PLAYERS_DEFAULT;
    const label = statsPlayersLabel(range).replace('Top', 'top').replace('All', 'all');
    const bounds = data.season === 'all' ? null : data.seasons[0]?.bounds;
    if (data.band && bounds) return `Ranks ${bounds.from}–${bounds.to} of ${where}`;
    if (data.band)
        return `The ${label} without the ${previousRange(range)?.label.replace('Top', 'top')}, in ${where}`;
    return range === 'all' ? `All HoM players of ${where}` : `The ${label} of ${where}`;
}

function focusTitle(data: StatsData) {
    const { hero, towers, map } = data.filters;
    const parts = [
        hero && formatHero(hero.hero ?? hero.base),
        towers.length > 0 && towers.map(formatLabel).join(' + '),
    ].filter(Boolean);
    const what = parts.length ? parts.join(' with ') : 'Every loadout';
    if (!map) return what;
    const name = formatMap(data.labels.maps[map.base]?.map ?? map.base);
    return `${what} on ${name}${map.variant ? ` (${map.variant})` : ''}`;
}

function Summary({ data }: { data: StatsData }) {
    const groupGames = gamesOf(data.group);
    const games = gamesOf(data.selection);
    const focused = !!data.filters.hero || data.filters.towers.length > 0;
    const players =
        data.season !== 'all' && data.seasons[0]?.players != null ? data.seasons[0].players : null;

    return (
        <section className='profile-panel'>
            <div className='profile-panel__head'>
                <h2 className='profile-panel__title'>{focusTitle(data)}</h2>
                <span className='profile-panel__note'>{groupTitle(data)}</span>
            </div>

            <div className='stats-summary'>
                <div className='stats-summary__item'>
                    <span className='stats-summary__value'>
                        {formatRate(rateOf(data.selection))}
                    </span>
                    <span className='stats-summary__label'>Win rate</span>
                </div>
                <div className='stats-summary__item'>
                    <span className='stats-summary__value' title={recordTitle(data.selection)}>
                        {games ? formatRecord(data.selection) : '–'}
                    </span>
                    <span className='stats-summary__label'>
                        in {formatNumber(games)} {games === 1 ? 'game' : 'games'}
                    </span>
                </div>
                {focused && (
                    <div className='stats-summary__item'>
                        <span className='stats-summary__value'>
                            {formatShare(share(games, groupGames))}
                        </span>
                        <span className='stats-summary__label'>
                            Pick rate, of {formatNumber(groupGames)} games
                        </span>
                    </div>
                )}
                {players !== null && data.mode === 'top' && (
                    <div className='stats-summary__item'>
                        <span className='stats-summary__value'>{formatNumber(players)}</span>
                        <span className='stats-summary__label'>Players counted</span>
                    </div>
                )}
            </div>

            <p className='versus-note'>
                {data.mode === 'top' && data.season === 'all'
                    ? 'Each season counts its own players in this range.'
                    : null}
                {data.missingSeasons.length > 0 &&
                    ` ${data.missingSeasons.length} season${data.missingSeasons.length > 1 ? 's are' : ' is'} skipped, their leaderboard isn't loaded yet.`}
            </p>
        </section>
    );
}

interface ResultsProps {
    data: StatsData;
    view: NonNullable<StatsSearch['view']>;
    min: number;
    /** minimum pick rate, in % */
    minPick: number;
    /** heroes, strats, maps: one row per variant (skin, classic / reversed) */
    split: boolean;
    /** strats: the 3 towers only, hero ignored */
    towersOnly: boolean;
    onFocus: (next: Partial<StatsSearch>) => void;
}

interface TableSpec {
    id: string;
    rows: StatsRow[];
    title: string;
    render: (r: StatsRow) => ReactNode;
    /** the row's name, for the A–Z sort */
    name: (r: StatsRow) => string;
    /** the filters "Focus →" sets, null: already focused */
    focus: (r: StatsRow) => Partial<StatsSearch> | null;
    pageSize?: number;
    /** rows sent / rows there are, and what they are */
    cut?: { total: number; noun: string };
}

function Results({ data, view, min, minPick, split, towersOnly, onFocus }: ResultsProps) {
    const groupGames = gamesOf(data.group);
    const pickOf = (r: StatsRow) => share(gamesOf(r.record), groupGames) ?? 0;
    const keep = <T extends StatsRow>(rows: T[], pick: (r: T) => number) =>
        rows.filter((r) => gamesOf(r.record) >= min && pick(r) >= minPick);
    const empty =
        minPick > 0
            ? `Nothing with ${min}+ ${min === 1 ? 'game' : 'games'} and a ${minPick}%+ pick rate here.`
            : `Nothing with ${min}+ ${min === 1 ? 'game' : 'games'} here.`;

    const focusButton = (next: Partial<StatsSearch> | null) =>
        next ? (
            <button
                type='button'
                className='versus-drill stats-focus'
                onClick={() => onFocus(next)}
            >
                Focus →
            </button>
        ) : null;

    const table = (spec: TableSpec) => {
        const shown = keep(spec.rows, pickOf);
        return (
            <>
                <RecordTable<StatsRow>
                    key={spec.id}
                    rows={shown}
                    rowKey={(r) => r.key}
                    label={{ title: spec.title, render: spec.render, sort: byText(spec.name) }}
                    columns={[
                        {
                            title: 'Pick rate',
                            numeric: true,
                            render: (r) => formatShare(pickOf(r)),
                            sort: (a, b) => gamesOf(b.record) - gamesOf(a.record),
                        },
                    ]}
                    after={[{ title: '', render: (r) => focusButton(spec.focus(r)) }]}
                    empty={empty}
                    {...(spec.pageSize ? { pageSize: spec.pageSize } : {})}
                />
                {spec.cut && spec.cut.total > spec.rows.length && (
                    <p className='versus-note'>
                        The {formatNumber(spec.rows.length)} most played of{' '}
                        {formatNumber(spec.cut.total)} {spec.cut.noun}.
                    </p>
                )}
            </>
        );
    };

    const { filters, labels } = data;
    const loadoutName = (key: string) => {
        const { hero, towers } = parseLoadout(key);
        return `${formatHero(hero)} ${towers.map(formatLabel).join(' ')}`;
    };

    if (view === 'heroes') {
        return split
            ? table({
                  id: 'hero-variants',
                  rows: data.heroVariants,
                  title: 'Hero',
                  render: (r) => <VariantLabel hero={r.key} labels={labels} />,
                  name: (r) => formatHero(r.key),
                  focus: (r) =>
                      filters.hero?.hero === r.key
                          ? null
                          : {
                                hero: formatHeroPick({
                                    base: labels.variants[r.key]?.base ?? r.key,
                                    hero: r.key,
                                }),
                            },
              })
            : table({
                  id: 'heroes',
                  rows: data.heroes,
                  title: 'Hero',
                  render: (r) => <HeroLabel base={r.key} labels={labels} />,
                  name: (r) => formatHero(r.key),
                  focus: (r) =>
                      r.key === filters.hero?.base && !filters.hero.hero ? null : { hero: r.key },
              });
    }

    if (view === 'towers') {
        return table({
            id: 'towers',
            rows: data.towers,
            title: 'Tower',
            render: (r) => <span className='stats-tower'>{formatLabel(r.key)}</span>,
            name: (r) => formatLabel(r.key),
            focus: (r) =>
                filters.towers.includes(r.key) || filters.towers.length >= STATS_MAX_TOWERS
                    ? null
                    : { towers: joinList([...filters.towers, r.key]) },
            pageSize: 60,
        });
    }

    if (view === 'loadouts') {
        if (towersOnly) {
            return table({
                id: 'trios',
                rows: data.trios,
                title: 'Towers',
                render: (r) => (
                    <span className='stats-tower'>
                        {r.key.split(',').map(formatLabel).join(' · ')}
                    </span>
                ),
                name: (r) => r.key.split(',').map(formatLabel).join(' '),
                focus: (r) =>
                    [...filters.towers].sort().join(',') === r.key ? null : { towers: r.key },
                pageSize: 50,
                cut: { total: data.trioCount, noun: 'tower picks' },
            });
        }
        if (split) {
            // the variants' portraits, keyed like the strat rows ("Quincy_Cyber")
            const variantLabels = {
                ...labels,
                heroes: {
                    ...labels.heroes,
                    ...Object.fromEntries(
                        Object.entries(labels.variants).map(([hero, v]) => [
                            hero,
                            { hero, portrait: v.portrait },
                        ]),
                    ),
                },
            };
            return table({
                id: 'loadout-variants',
                rows: data.loadoutVariants,
                title: 'Strat',
                render: (r) => <LoadoutLabel loadoutKey={r.key} labels={variantLabels} />,
                name: (r) => loadoutName(r.key),
                focus: (r) => {
                    const { hero, towers } = parseLoadout(r.key);
                    const base = labels.variants[hero]?.base ?? hero;
                    return { hero: formatHeroPick({ base, hero }), towers: joinList(towers) };
                },
                pageSize: 50,
                cut: { total: data.loadoutVariantCount, noun: 'strats' },
            });
        }
        return table({
            id: 'loadouts',
            rows: data.loadouts,
            title: 'Strat',
            render: (r) => <LoadoutLabel loadoutKey={r.key} labels={labels} />,
            name: (r) => loadoutName(r.key),
            focus: (r) => {
                const { hero, towers } = parseLoadout(r.key);
                return { hero, towers: joinList(towers) };
            },
            pageSize: 50,
            cut: { total: data.loadoutCount, noun: 'strats' },
        });
    }

    // maps: with a focus, the pick rate on each map; without one, how often each map is played
    const focused = !!filters.hero || filters.towers.length > 0;
    const mapRows = split ? data.mapVariants : data.maps;
    const allMaps = mapRows.reduce((sum, m) => sum + m.total, 0);
    const mapPick = (r: StatsMapRow) =>
        (focused ? share(gamesOf(r.record), r.total) : share(r.total, allMaps)) ?? 0;
    const picked = filters.map
        ? filters.map.variant
            ? `${filters.map.base}:${filters.map.variant}`
            : filters.map.base
        : null;
    const reversible = new Set(
        data.options.maps
            .filter((m) => m.variants.some((v) => v.variant === 'reversed'))
            .map((m) => m.key),
    );
    // split rows: "oasis" is the classic version when a reversed one exists
    const pickKey = (key: string) =>
        split && !key.includes(':') && reversible.has(key) ? `${key}:classic` : key;
    return (
        <RecordTable<StatsMapRow>
            key={split ? 'map-variants' : 'maps'}
            rows={keep(mapRows, mapPick)}
            rowKey={(r) => r.key}
            label={{
                title: 'Map',
                render: (r) => <MapLabel mapKey={r.key} labels={labels} />,
                sort: byText((r) => formatMap(labels.maps[r.key]?.map ?? r.key)),
            }}
            columns={[
                {
                    title: focused ? 'Pick rate' : 'Played',
                    numeric: true,
                    render: (r) => formatShare(mapPick(r)),
                    sort: (a, b) => mapPick(b) - mapPick(a),
                },
            ]}
            after={[
                {
                    title: '',
                    render: (r) =>
                        focusButton(pickKey(r.key) === picked ? null : { map: pickKey(r.key) }),
                },
            ]}
            empty={empty}
        />
    );
}

export default function Stats() {
    const search = routeApi.useSearch();
    const navigate = routeApi.useNavigate();
    const [pickingPlayer, setPickingPlayer] = useState(false);

    const seasons = useSeasons();
    const liveSeason = seasons.data?.liveSeason;
    const playerMode = !!search.player || pickingPlayer;
    const players = search.players ?? STATS_PLAYERS_DEFAULT;
    const towers = splitList(search.towers).slice(0, STATS_MAX_TOWERS);
    const view = search.view ?? STATS_VIEW_DEFAULT;
    const min = search.min ?? STATS_MIN_DEFAULT;
    const minPick = search.pick ?? STATS_MIN_PICK_DEFAULT;
    const split = !!search.variants;
    const towersOnly = !!search.towersOnly;

    const { data, isLoading, error, refetch, isPlaceholderData } = useStats(
        {
            season: search.season,
            player: search.player,
            players,
            band: !!search.band,
            map: search.map,
            hero: search.hero,
            towers,
        },
        !playerMode || !!search.player,
    );

    // one player: pick among the season's leaderboard (the live one for "all seasons")
    const boardSeason = typeof search.season === 'number' ? search.season : liveSeason;
    const ranked = useRankedPlayers(
        playerMode ? boardSeason : undefined,
        boardSeason === liveSeason,
    );

    const update = (next: Partial<StatsSearch>) => {
        if ('player' in next && !next.player) setPickingPlayer(false);
        void navigate({
            search: (prev) => {
                const merged = { ...prev, ...next };
                const custom =
                    !merged.player && merged.players && merged.players !== STATS_PLAYERS_DEFAULT;
                return {
                    season: merged.season,
                    player: merged.player,
                    players: !merged.player && custom ? merged.players : undefined,
                    band:
                        !merged.player &&
                        merged.band &&
                        previousRange(merged.players ?? STATS_PLAYERS_DEFAULT)
                            ? true
                            : undefined,
                    map: merged.map,
                    hero: merged.hero,
                    towers: merged.towers || undefined,
                    view:
                        merged.view && merged.view !== STATS_VIEW_DEFAULT ? merged.view : undefined,
                    min: merged.min && merged.min !== STATS_MIN_DEFAULT ? merged.min : undefined,
                    pick:
                        merged.pick && merged.pick !== STATS_MIN_PICK_DEFAULT
                            ? merged.pick
                            : undefined,
                    variants: merged.variants || undefined,
                    towersOnly: merged.towersOnly || undefined,
                };
            },
            replace: true,
            resetScroll: false,
        });
    };

    const seasonOptions = [
        { value: 'all', label: 'All seasons' },
        ...(seasons.data?.seasons ?? []).map((s) => ({
            value: String(s.id),
            label: `${seasonLabel(s.id)}${s.live ? ' (live)' : ''}`,
        })),
    ];
    const seasonValue =
        search.season === undefined ? String(liveSeason ?? '') : String(search.season);

    const playerOptions = useMemo(() => {
        const list = ranked.players.map((p) => ({
            value: p.id,
            label: `#${p.rank} ${p.name}${getAlias(p) ? ` (${getAlias(p)})` : ''}`,
        }));
        if (search.player && !list.some((o) => o.value === search.player)) {
            const known = data?.player?.userId === search.player ? data.player : null;
            list.unshift({
                value: search.player,
                label: known ? playerLabel(known) : 'Selected player',
            });
        }
        return list;
    }, [ranked.players, search.player, data?.player]);

    const options = data?.options;
    const heroPick = search.hero ? parseHero(search.hero) : undefined;
    const mapChipOptions: MapChipOption[] = (options?.maps ?? []).map((m) => ({
        ...m,
        map: data?.labels.maps[m.key]?.map ?? m.key,
        image: data?.labels.maps[m.key]?.image,
    }));
    const hasFocus = !!search.map || !!search.hero || towers.length > 0;
    const previous = previousRange(players);

    return (
        <main className='page stats'>
            <div className='page__head'>
                <div>
                    <h1 className='page__title'>Stats</h1>
                    <p className='page__subtitle'>
                        How often heroes, towers and strats are picked, and how they do.
                    </p>
                </div>
            </div>

            <section className='profile-panel stats-controls'>
                <div className='versus-controls'>
                    <div className='versus-controls__group'>
                        <span className='versus-controls__label' id='stats-mode'>
                            Players
                        </span>
                        <div className='h2h-scope' role='group' aria-labelledby='stats-mode'>
                            <button
                                type='button'
                                className='h2h-scope__option'
                                aria-pressed={!playerMode}
                                onClick={() => update({ player: undefined })}
                            >
                                Group
                            </button>
                            <button
                                type='button'
                                className='h2h-scope__option'
                                aria-pressed={playerMode}
                                onClick={() => setPickingPlayer(true)}
                            >
                                One player
                            </button>
                        </div>
                    </div>

                    {playerMode ? (
                        <div className='versus-controls__group versus-controls__group--grow'>
                            <span className='versus-controls__label'>Player</span>
                            <Dropdown
                                variant='compact'
                                options={playerOptions}
                                value={search.player ?? ''}
                                searchable
                                disabled={ranked.isLoading && !search.player}
                                placeholder={
                                    ranked.isLoading ? 'Loading the leaderboard…' : 'Pick a player'
                                }
                                aria-label='Player'
                                noResultsText='No player with that name'
                                onSelect={(id) => update({ player: id })}
                            />
                        </div>
                    ) : (
                        <>
                            <div className='versus-controls__group'>
                                <span className='versus-controls__label'>Range</span>
                                <Dropdown
                                    className='versus-controls__range'
                                    variant='compact'
                                    options={STATS_PLAYERS}
                                    value={players}
                                    aria-label='Players counted'
                                    onSelect={(next) => update({ players: next })}
                                />
                            </div>
                            {previous && (
                                <label className='versus-controls__band'>
                                    <input
                                        type='checkbox'
                                        checked={!!search.band}
                                        onChange={(event) =>
                                            update({ band: event.target.checked || undefined })
                                        }
                                    />
                                    Leave out the {previous.label.replace('Top', 'top')}
                                </label>
                            )}
                        </>
                    )}

                    <div className='versus-controls__group'>
                        <span className='versus-controls__label'>Season</span>
                        {seasonValue && (
                            <Dropdown
                                className='versus-controls__season'
                                variant='compact'
                                options={seasonOptions}
                                value={seasonValue}
                                aria-label='Season'
                                onSelect={(value) =>
                                    update({
                                        season:
                                            value === 'all'
                                                ? 'all'
                                                : Number(value) === liveSeason
                                                  ? undefined
                                                  : Number(value),
                                    })
                                }
                            />
                        )}
                    </div>
                </div>

                <div className='versus-controls stats-controls__focus'>
                    <div className='versus-controls__group'>
                        <span className='versus-controls__label'>Map</span>
                        <MapChip
                            value={search.map}
                            options={mapChipOptions}
                            onChange={(map) => update({ map })}
                        />
                    </div>
                    <div className='versus-controls__group'>
                        <span className='versus-controls__label'>Hero</span>
                        <HeroChips
                            heroes={heroPick ? [heroPick] : []}
                            max={1}
                            options={options}
                            onChange={(next) =>
                                update({ hero: next[0] ? formatHeroPick(next[0]) : undefined })
                            }
                        />
                    </div>
                    <div className='versus-controls__group versus-controls__group--grow'>
                        <span className='versus-controls__label'>Towers (all of them)</span>
                        <TowerChips
                            towers={towers}
                            max={STATS_MAX_TOWERS}
                            options={options}
                            onChange={(next) => update({ towers: joinList(next) })}
                        />
                    </div>
                    {hasFocus && (
                        <button
                            type='button'
                            className='text-link versus-link-button stats-controls__clear'
                            onClick={() =>
                                update({ map: undefined, hero: undefined, towers: undefined })
                            }
                        >
                            Clear map, hero and towers
                        </button>
                    )}
                </div>
            </section>

            {playerMode && !search.player ? (
                <p className='profile-panel__empty versus-prompt'>
                    Pick a player above to see their stats.
                </p>
            ) : isLoading ? (
                <Loading label='Counting the games…' />
            ) : error || !data ? (
                <ErrorState error={error} onRetry={() => refetch()} />
            ) : (
                <div className={`versus${isPlaceholderData ? ' versus--updating' : ''}`}>
                    <Summary data={data} />
                    {gamesOf(data.selection) > 0 || data.maps.length > 0 ? (
                        <section className='profile-panel'>
                            <div className='profile-panel__head stats-results__head'>
                                <div className='h2h-scope' role='group' aria-label='Show'>
                                    {STATS_VIEWS.map((v) => (
                                        <button
                                            key={v.value}
                                            type='button'
                                            className='h2h-scope__option'
                                            aria-pressed={view === v.value}
                                            onClick={() => update({ view: v.value })}
                                        >
                                            {v.label}
                                        </button>
                                    ))}
                                </div>
                                {(view === 'heroes' ||
                                    view === 'maps' ||
                                    (view === 'loadouts' && !towersOnly)) && (
                                    <label className='versus-controls__band'>
                                        <input
                                            type='checkbox'
                                            checked={split}
                                            onChange={(event) =>
                                                update({
                                                    variants: event.target.checked || undefined,
                                                })
                                            }
                                        />
                                        Split variants
                                    </label>
                                )}
                                {view === 'loadouts' && (
                                    <label className='versus-controls__band'>
                                        <input
                                            type='checkbox'
                                            checked={!towersOnly}
                                            onChange={(event) =>
                                                update({
                                                    towersOnly: event.target.checked
                                                        ? undefined
                                                        : true,
                                                })
                                            }
                                        />
                                        Include hero
                                    </label>
                                )}
                                <div className='stats-results__mins'>
                                    <label className='stats-results__min'>
                                        <span className='versus-controls__label'>Min. games</span>
                                        <Dropdown
                                            className='stats-results__select'
                                            variant='compact'
                                            options={STATS_MIN_GAMES.map((n) => ({
                                                value: n,
                                                label: String(n),
                                            }))}
                                            value={min}
                                            aria-label='Minimum games'
                                            onSelect={(n) => update({ min: n })}
                                        />
                                    </label>
                                    <label className='stats-results__min'>
                                        <span className='versus-controls__label'>
                                            Min. pick rate
                                        </span>
                                        <Dropdown
                                            className='stats-results__select'
                                            variant='compact'
                                            options={STATS_MIN_PICK.map((n) => ({
                                                value: n,
                                                label: n === 0 ? 'Any' : `${n}%`,
                                            }))}
                                            value={minPick}
                                            aria-label='Minimum pick rate'
                                            onSelect={(n) => update({ pick: n })}
                                        />
                                    </label>
                                </div>
                            </div>
                            <Results
                                data={data}
                                view={view}
                                min={min}
                                minPick={minPick}
                                split={split}
                                towersOnly={towersOnly}
                                onFocus={update}
                            />
                        </section>
                    ) : (
                        <p className='profile-panel__empty versus-prompt'>
                            No recorded game matches these filters.
                            {data.mode === 'player' && data.player && (
                                <>
                                    {' '}
                                    <Link
                                        to='/user/$userId'
                                        params={{ userId: data.player.userId }}
                                    >
                                        Open the profile
                                    </Link>
                                </>
                            )}
                        </p>
                    )}
                </div>
            )}
        </main>
    );
}
