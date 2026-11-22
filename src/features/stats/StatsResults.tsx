import ItemLabel from '@/components/labels/ItemLabel';
import LoadoutLabel from '@/components/labels/LoadoutLabel';
import LoadoutPictures from '@/components/labels/LoadoutPictures';
import MapLabel from '@/components/labels/MapLabel';
import RecordTable from '@/components/record-table/RecordTable';
import { STATS_MAX_TOWERS } from '@/config/stats';
import { useSplitHeroes, useSplitMaps } from '@/hooks/useSplitVariants';
import type {
    Stats,
    StatsMapRow,
    StatsSearch,
    StatsTableSpec,
    StatsView,
    StratForm,
} from '@/types/stats';
import { formatLabel, plural } from '@/utils/format';
import { heroThumb, towerPicture } from '@/utils/gamePictures';
import { formatHero, formatHeroPick } from '@/utils/hero';
import { formatTowerList, loadoutName, parseLoadout, withVariantLabels } from '@/utils/loadout';
import { formatMap } from '@/utils/map';
import { formatShare, gamesOf, keepRows, share } from '@/utils/record';
import { joinList } from '@/utils/search';
import { byText } from '@/utils/sort';
import FocusButton from './FocusButton';
import MapStratsTable from './MapStratsTable';
import StatsTable from './StatsTable';

interface StatsResultsProps {
    data: Stats;
    view: StatsView;
    min: number;
    /** minimum pick rate, in % */
    minPick: number;
    /** strats: the 3 towers only, hero ignored */
    towersOnly: boolean;
    onFocus: (next: Partial<StatsSearch>) => void;
}

/** The table of the chosen view: heroes, towers, strats, maps or each map's top strat. */
export default function StatsResults(props: StatsResultsProps) {
    const { data, view, min, minPick, towersOnly, onFocus } = props;
    const [splitMaps] = useSplitMaps();
    const [splitHeroes] = useSplitHeroes();
    const { filters, labels } = data;

    const groupGames = gamesOf(data.group);
    const games = `${min}+ ${plural(min, 'game')}`;
    const empty =
        minPick > 0
            ? `Nothing with ${games} and a ${minPick}%+ pick rate here.`
            : `Nothing with ${games} here.`;

    // keyed by table: another table starts on its own sort and page
    function table(spec: StatsTableSpec) {
        return (
            <StatsTable
                key={spec.id}
                spec={spec}
                groupGames={groupGames}
                min={min}
                minPick={minPick}
                empty={empty}
                onFocus={onFocus}
            />
        );
    }

    if (view === 'heroes') {
        return splitHeroes
            ? table({
                  id: 'hero-variants',
                  rows: data.heroVariants,
                  title: 'Hero',
                  render: (r) => {
                      const variant = labels.variants[r.key];
                      return (
                          <ItemLabel
                              {...heroThumb(r.key, variant?.portrait)}
                              sub={r.key === (variant?.base ?? r.key) ? 'Classic' : undefined}
                          >
                              {formatHero(r.key)}
                          </ItemLabel>
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
                      <ItemLabel {...heroThumb(r.key, labels.heroes[r.key]?.portrait)}>
                          {formatHero(r.key)}
                      </ItemLabel>
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
            render: (r) => (
                <ItemLabel kind='tower' image={towerPicture(r.key)}>
                    {formatLabel(r.key)}
                </ItemLabel>
            ),
            name: (r) => formatLabel(r.key),
            focus: (r) =>
                filters.towers.includes(r.key) || filters.towers.length >= STATS_MAX_TOWERS
                    ? null
                    : { towers: joinList([...filters.towers, r.key]) },
        });
    }

    // the strats table's form, which the map strats tab follows
    const stratForm: StratForm = towersOnly
        ? 'trios'
        : splitHeroes
          ? 'loadoutVariants'
          : 'loadouts';

    function stratSpec(): StatsTableSpec {
        if (stratForm === 'trios') {
            return {
                id: 'trios',
                rows: data.trios,
                title: 'Towers',
                render: (r) => (
                    <span className='stats-trio'>
                        <span className='stats-tower'>{formatTowerList(r.key, ' · ')}</span>
                        <LoadoutPictures towers={r.key.split(',')} />
                    </span>
                ),
                name: (r) => formatTowerList(r.key, ' '),
                focus: (r) =>
                    [...filters.towers].sort().join(',') === r.key ? null : { towers: r.key },
                counted: 'tower pick',
                strats: true,
            };
        }
        if (stratForm === 'loadoutVariants') {
            // the variants' portraits, keyed like the strat rows ("Quincy_Cyber")
            const variantLabels = withVariantLabels(labels);
            return {
                id: 'loadout-variants',
                rows: data.loadoutVariants,
                title: 'Strat',
                render: (r) => <LoadoutLabel loadoutKey={r.key} labels={variantLabels} pictures />,
                name: (r) => loadoutName(r.key),
                focus: (r) => {
                    const { hero, towers } = parseLoadout(r.key);
                    const base = labels.variants[hero]?.base ?? hero;
                    return { hero: formatHeroPick({ base, hero }), towers: joinList(towers) };
                },
                counted: 'strat',
                strats: true,
            };
        }
        return {
            id: 'loadouts',
            rows: data.loadouts,
            title: 'Strat',
            render: (r) => <LoadoutLabel loadoutKey={r.key} labels={labels} pictures />,
            name: (r) => loadoutName(r.key),
            focus: (r) => {
                const { hero, towers } = parseLoadout(r.key);
                return { hero, towers: joinList(towers) };
            },
            counted: 'strat',
            strats: true,
        };
    }

    if (view === 'loadouts') return table(stratSpec());

    const reversible = new Set(
        data.options.maps
            .filter((m) => m.variants.some((v) => v.variant === 'reversed'))
            .map((m) => m.key),
    );
    const pickKey = (key: string) =>
        splitMaps && !key.includes(':') && reversible.has(key) ? `${key}:classic` : key;

    if (view === 'mapStrats') {
        const mapStrats = splitMaps ? data.mapVariantStrats : data.mapStrats;
        return (
            <MapStratsTable
                key={`${splitMaps ? 'map-variants' : 'maps'}:${stratForm}`}
                rows={mapStrats?.[stratForm] ?? []}
                labels={labels}
                strat={stratSpec()}
                mapFocus={pickKey}
                onFocus={onFocus}
            />
        );
    }

    // maps: with a focus, the pick rate on each map; without one, how often each map is played
    const focused = !!filters.hero || filters.towers.length > 0;
    const mapRows = splitMaps ? data.mapVariants : data.maps;
    const allMaps = mapRows.reduce((sum, m) => sum + m.total, 0);
    const mapPick = (r: StatsMapRow) =>
        (focused ? share(gamesOf(r.record), r.total) : share(r.total, allMaps)) ?? 0;
    const picked = filters.map
        ? filters.map.variant
            ? `${filters.map.base}:${filters.map.variant}`
            : filters.map.base
        : null;
    return (
        <RecordTable<StatsMapRow>
            key={splitMaps ? 'map-variants' : 'maps'}
            className='stats-table'
            rows={keepRows(mapRows, mapPick, min, minPick)}
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
                    render: (r) => (
                        <FocusButton
                            next={pickKey(r.key) === picked ? null : { map: pickKey(r.key) }}
                            onFocus={onFocus}
                        />
                    ),
                },
            ]}
            empty={empty}
        />
    );
}
