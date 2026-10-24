import HeroLabel from '@/components/labels/HeroLabel';
import LoadoutLabel from '@/components/labels/LoadoutLabel';
import MapLabel from '@/components/labels/MapLabel';
import RecordTable from '@/components/record-table/RecordTable';
import Note from '@/components/text/Note';
import { STATS_MAX_TOWERS, STATS_PAGE_SIZE, STATS_TOWERS_PAGE_SIZE } from '@/config/stats';
import type {
    Stats,
    StatsMapRow,
    StatsRow,
    StatsSearch,
    StatsTableSpec,
    StatsView,
} from '@/types/stats';
import { formatLabel, formatNumber, plural } from '@/utils/format';
import { formatHero, formatHeroPick } from '@/utils/hero';
import { formatTowerList, loadoutName, parseLoadout } from '@/utils/loadout';
import { formatMap } from '@/utils/map';
import { formatShare, gamesOf, share } from '@/utils/record';
import { joinList } from '@/utils/search';
import { byText } from '@/utils/sort';

interface StatsResultsProps {
    data: Stats;
    view: StatsView;
    min: number;
    /** minimum pick rate, in % */
    minPick: number;
    /** heroes, strats, maps: one row per variant (skin, classic / reversed) */
    split: boolean;
    /** strats: the 3 towers only, hero ignored */
    towersOnly: boolean;
    onFocus: (next: Partial<StatsSearch>) => void;
}

/** The table of the chosen view: heroes, towers, strats or maps. */
export default function StatsResults(props: StatsResultsProps) {
    const { data, view, min, minPick, split, towersOnly, onFocus } = props;
    const { filters, labels } = data;

    const groupGames = gamesOf(data.group);
    const pickOf = (r: StatsRow) => share(gamesOf(r.record), groupGames) ?? 0;
    const keep = <T extends StatsRow>(rows: T[], pick: (r: T) => number) =>
        rows.filter((r) => gamesOf(r.record) >= min && pick(r) >= minPick);
    const games = `${min}+ ${plural(min, 'game')}`;
    const empty =
        minPick > 0
            ? `Nothing with ${games} and a ${minPick}%+ pick rate here.`
            : `Nothing with ${games} here.`;

    const focusButton = (next: Partial<StatsSearch> | null) =>
        next ? (
            <button type='button' className='drill-link' onClick={() => onFocus(next)}>
                <span className='drill-link__text'>Focus </span>→
            </button>
        ) : null;

    const table = (spec: StatsTableSpec) => (
        <>
            <RecordTable<StatsRow>
                key={spec.id}
                className='stats-table'
                rows={keep(spec.rows, pickOf)}
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
                pageSize={spec.pageSize}
            />
            {spec.cut && spec.cut.total > spec.rows.length && (
                <Note>
                    The {formatNumber(spec.rows.length)} most played of{' '}
                    {formatNumber(spec.cut.total)} {spec.cut.noun}.
                </Note>
            )}
        </>
    );

    if (view === 'heroes') {
        return split
            ? table({
                  id: 'hero-variants',
                  rows: data.heroVariants,
                  title: 'Hero',
                  render: (r) => {
                      const variant = labels.variants[r.key];
                      return (
                          <HeroLabel
                              hero={r.key}
                              portrait={variant?.portrait}
                              sub={r.key === (variant?.base ?? r.key) ? 'Classic' : undefined}
                          />
                      );
                  },
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
                  render: (r) => (
                      <HeroLabel
                          hero={r.key}
                          pictured={labels.heroes[r.key]?.hero}
                          portrait={labels.heroes[r.key]?.portrait}
                      />
                  ),
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
            pageSize: STATS_TOWERS_PAGE_SIZE,
        });
    }

    if (view === 'loadouts') {
        if (towersOnly) {
            return table({
                id: 'trios',
                rows: data.trios,
                title: 'Towers',
                render: (r) => <span className='stats-tower'>{formatTowerList(r.key, ' · ')}</span>,
                name: (r) => formatTowerList(r.key, ' '),
                focus: (r) =>
                    [...filters.towers].sort().join(',') === r.key ? null : { towers: r.key },
                pageSize: STATS_PAGE_SIZE,
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
                pageSize: STATS_PAGE_SIZE,
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
            pageSize: STATS_PAGE_SIZE,
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
            className='stats-table'
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
