import { SearchIcon } from '@/components/icons';
import Dropdown from '@/components/dropdown/Dropdown';
import type { SeasonSummary } from '@/types/info';
import {
    type MatchFilterOptions,
    type MatchesQuery,
    type MatchSort,
    SORT_LABELS,
} from '@/types/match';
import type { HeroPick } from '@/types/tower';
import { heroImage } from '@/utils/assetOverrides';
import {
    formatHero,
    formatHeroPick,
    formatLabel,
    formatMap,
    formatNumber,
    joinList,
    parseHero,
    seasonLabel,
    splitList,
} from '@/utils/format';

const SORT_OPTIONS = (Object.keys(SORT_LABELS) as MatchSort[]).map((value) => ({
    value,
    label: SORT_LABELS[value],
}));

interface MatchFiltersProps {
    query: MatchesQuery;
    onChange: (patch: Partial<MatchesQuery>) => void;
    options?: MatchFilterOptions | undefined;
    seasons: SeasonSummary[];
    liveSeason?: number | undefined;
    seasonId?: number | undefined;
    playerText: string;
    onPlayerText: (value: string) => void;
}

export default function MatchFilters(props: MatchFiltersProps) {
    const { query, onChange, options, seasons, liveSeason, seasonId, playerText, onPlayerText } =
        props;

    const heroes = splitList(query.heroes).map(parseHero);
    const towers = splitList(query.towers);
    const maxHeroes = options?.maxHeroes ?? 2;
    const maxTowers = options?.maxTowers ?? 6;

    const setHeroes = (next: HeroPick[]) =>
        onChange({ heroes: joinList(next.map(formatHeroPick)) });
    const setTowers = (next: string[]) => onChange({ towers: joinList(next) });

    const sameSidePossible = heroes.length <= 1 && towers.length <= 3;
    const parts = [playerText.trim() !== '', heroes.length > 0, towers.length > 0].filter(
        Boolean,
    ).length;
    const sameSideUseful = sameSidePossible && (parts >= 2 || towers.length >= 2);

    const seasonOptions = seasons.map((s) => ({
        value: s.id,
        label: `${seasonLabel(s.id)}${s.live ? ' (live)' : ''}`,
    }));

    const heroAddOptions = (options?.heroes ?? [])
        .filter((h) => h.count > 0 && !heroes.some((p) => p.base === h.base))
        .map((h) => ({ value: h.base, label: `${formatHero(h.base)} (${formatNumber(h.count)})` }));

    const towerAddOptions = (options?.towers ?? [])
        .filter((t) => t.count > 0 && !towers.includes(t.tower))
        .map((t) => ({
            value: t.tower,
            label: `${formatLabel(t.tower)} (${formatNumber(t.count)})`,
        }));

    const mapOptions = [
        { value: '', label: 'Any map' },
        // keep a map from the URL selectable even when it has no match in this season
        ...(query.map && !options?.maps.some((m) => m.key === query.map)
            ? [{ value: query.map, label: `${query.map} (0)` }]
            : []),
        ...(options?.maps ?? [])
            .slice()
            .sort((a, b) => formatMap(a.map).localeCompare(formatMap(b.map)))
            .map((m) => ({
                value: m.key,
                label: `${formatMap(m.map)} (${formatNumber(m.count)})`,
            })),
    ];

    return (
        <section className='match-filters' aria-label='Filters'>
            <div className='match-filters__row'>
                <label className='match-filters__search'>
                    <span className='visually-hidden'>Player name or id</span>
                    <SearchIcon className='match-filters__search-icon' aria-hidden='true' />
                    <input
                        type='search'
                        value={playerText}
                        placeholder='Player name, alias or id'
                        onChange={(e) => onPlayerText(e.target.value)}
                    />
                </label>
                <div className='match-filters__field'>
                    <label htmlFor='match-filters-sort' className='match-filters__label'>
                        Sort
                    </label>
                    <Dropdown
                        id='match-filters-sort'
                        options={SORT_OPTIONS}
                        value={query.sort ?? 'newest'}
                        onSelect={(sort) =>
                            onChange({ sort: sort === 'newest' ? undefined : sort })
                        }
                    />
                </div>
                {seasons.length > 1 && (
                    <div className='match-filters__field'>
                        <label htmlFor='match-filters-season' className='match-filters__label'>
                            Season
                        </label>
                        <Dropdown
                            id='match-filters-season'
                            options={seasonOptions}
                            value={seasonId ?? ''}
                            placeholder='Season'
                            onSelect={(id) =>
                                onChange({
                                    season: id === liveSeason ? undefined : id,
                                    heroes: undefined,
                                    towers: undefined,
                                    map: undefined,
                                })
                            }
                        />
                    </div>
                )}
            </div>

            <div className='match-filters__group'>
                <span className='match-filters__label'>Heroes</span>
                <div className='match-filters__chips'>
                    {heroes.map((pick, index) => {
                        const option = options?.heroes.find((h) => h.base === pick.base);
                        const variant =
                            option?.variants.find((v) => v.hero === pick.hero) ??
                            option?.variants[0];
                        const portrait = heroImage(
                            variant?.hero ?? pick.hero ?? pick.base,
                            variant?.portrait,
                        );
                        const variantOptions = [
                            {
                                value: '',
                                label: `Any variant${option ? ` (${formatNumber(option.count)})` : ''}`,
                            },
                            ...(pick.hero && !option?.variants.some((v) => v.hero === pick.hero)
                                ? [{ value: pick.hero, label: `${formatHero(pick.hero)} (0)` }]
                                : []),
                            ...(option?.variants ?? []).map((v) => ({
                                value: v.hero,
                                label: `${v.hero === pick.base ? 'Classic' : formatHero(v.hero)} (${formatNumber(v.count)})`,
                            })),
                        ];
                        return (
                            <span key={pick.base} className='match-filters__hero-wrap'>
                                {index > 0 && <span className='match-filters__vs'>vs</span>}
                                <span className='chip-filter chip-filter--hero'>
                                    {portrait && (
                                        <img className='chip-filter__img' src={portrait} alt='' />
                                    )}
                                    <span className='chip-filter__name'>
                                        {formatHero(pick.base)}
                                    </span>
                                    <Dropdown
                                        className='chip-filter__variant'
                                        aria-label={`${formatHero(pick.base)} variant`}
                                        variant='pill'
                                        options={variantOptions}
                                        value={pick.hero ?? ''}
                                        onSelect={(hero) =>
                                            setHeroes(
                                                heroes.map((h) =>
                                                    h.base === pick.base
                                                        ? hero
                                                            ? { base: h.base, hero }
                                                            : { base: h.base }
                                                        : h,
                                                ),
                                            )
                                        }
                                    />
                                    <button
                                        type='button'
                                        className='chip-filter__remove'
                                        aria-label={`Remove ${formatHero(pick.base)}`}
                                        onClick={() =>
                                            setHeroes(heroes.filter((h) => h.base !== pick.base))
                                        }
                                    >
                                        ×
                                    </button>
                                </span>
                            </span>
                        );
                    })}
                    {heroes.length < maxHeroes && (
                        <Dropdown
                            className='match-filters__add'
                            aria-label='Add a hero'
                            placeholder={heroes.length ? '+ Opponent hero' : '+ Add hero'}
                            options={heroAddOptions}
                            value=''
                            onSelect={(base) => setHeroes([...heroes, { base }])}
                        />
                    )}
                </div>
            </div>

            <div className='match-filters__group'>
                <span className='match-filters__label'>Towers </span>
                <div className='match-filters__chips'>
                    {towers.map((tower) => (
                        <span key={tower} className='chip-filter'>
                            <span className='chip-filter__name'>{formatLabel(tower)}</span>
                            <button
                                type='button'
                                className='chip-filter__remove'
                                aria-label={`Remove ${formatLabel(tower)}`}
                                onClick={() => setTowers(towers.filter((t) => t !== tower))}
                            >
                                ×
                            </button>
                        </span>
                    ))}
                    {towers.length < maxTowers && (
                        <Dropdown
                            className='match-filters__add'
                            aria-label='Add a tower'
                            placeholder='+ Add tower'
                            options={towerAddOptions}
                            value=''
                            onSelect={(tower) => setTowers([...towers, tower])}
                        />
                    )}
                </div>
            </div>

            <div className='match-filters__row'>
                <div className='match-filters__field match-filters__field--map'>
                    <label htmlFor='match-filters-map' className='match-filters__label'>
                        Map
                    </label>
                    <Dropdown
                        id='match-filters-map'
                        options={mapOptions}
                        value={query.map ?? ''}
                        onSelect={(map) => onChange({ map: map || undefined })}
                    />
                </div>
                <label
                    className={`match-filters__toggle${sameSideUseful ? '' : ' match-filters__toggle--off'}`}
                >
                    <input
                        type='checkbox'
                        checked={!!query.sameSide && sameSidePossible}
                        disabled={!sameSidePossible}
                        onChange={(e) => onChange({ sameSide: e.target.checked || undefined })}
                    />
                    <span>
                        Same player
                        <span className='match-filters__toggle-help'>
                            {sameSidePossible
                                ? 'Name, hero and towers must all be on one side.'
                                : 'Only with one hero and up to 3 towers.'}
                        </span>
                    </span>
                </label>
            </div>
        </section>
    );
}
