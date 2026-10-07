import { SearchIcon } from '@/components/icons';
import type { MatchFilterOptions, MatchesQuery, MatchSort } from '@/types/match';
import type { SeasonSummary } from '@/types/info';
import {
    formatHero,
    formatLabel,
    formatMap,
    formatNumber,
    joinList,
    splitList,
} from '@/utils/format';

export const SORT_LABELS: Record<MatchSort, string> = {
    newest: 'Newest first',
    oldest: 'Oldest first',
    longest: 'Longest',
    shortest: 'Shortest',
    rounds: 'Most rounds',
};

/** "Quincy" or "Quincy:Quincy_Cyber" ⇄ { base, hero } */
export const parseHero = (item: string) => {
    const [base, hero] = item.split(':');
    return { base, hero: hero || undefined };
};
const heroItem = ({ base, hero }: { base: string; hero?: string }) =>
    hero ? `${base}:${hero}` : base;

interface MatchFiltersProps {
    query: MatchesQuery;
    onChange: (patch: Partial<MatchesQuery>) => void;
    options?: MatchFilterOptions;
    seasons: SeasonSummary[];
    liveSeason?: number;
    seasonId?: number;
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

    const setHeroes = (next: { base: string; hero?: string }[]) =>
        onChange({ heroes: joinList(next.map(heroItem)) });
    const setTowers = (next: string[]) => onChange({ towers: joinList(next) });

    const sameSidePossible = heroes.length <= 1 && towers.length <= 3;
    // worth it once two things could be split across players: name + hero, hero + tower, 2+ towers…
    const parts = [playerText.trim() !== '', heroes.length > 0, towers.length > 0].filter(
        Boolean,
    ).length;
    const sameSideUseful = sameSidePossible && (parts >= 2 || towers.length >= 2);

    return (
        <section className='match-filters' aria-label='Filters'>
            <div className='match-filters__row'>
                <label className='match-filters__search'>
                    <span className='visually-hidden'>Player name</span>
                    <SearchIcon className='match-filters__search-icon' aria-hidden='true' />
                    <input
                        type='search'
                        value={playerText}
                        placeholder='Player name or real name'
                        onChange={(e) => onPlayerText(e.target.value)}
                    />
                </label>
                <label className='match-filters__field'>
                    <span className='match-filters__label'>Sort</span>
                    <select
                        className='select'
                        value={query.sort ?? 'newest'}
                        onChange={(e) =>
                            onChange({
                                sort:
                                    e.target.value === 'newest'
                                        ? undefined
                                        : (e.target.value as MatchSort),
                            })
                        }
                    >
                        {(Object.keys(SORT_LABELS) as MatchSort[]).map((s) => (
                            <option key={s} value={s}>
                                {SORT_LABELS[s]}
                            </option>
                        ))}
                    </select>
                </label>
                {seasons.length > 1 && (
                    <label className='match-filters__field'>
                        <span className='match-filters__label'>Season</span>
                        <select
                            className='select'
                            value={seasonId ?? ''}
                            onChange={(e) => {
                                const id = Number(e.target.value);
                                // other seasons have other heroes/maps: reset those filters
                                onChange({
                                    season: id === liveSeason ? undefined : id,
                                    heroes: undefined,
                                    towers: undefined,
                                    map: undefined,
                                });
                            }}
                        >
                            {seasons.map((s) => (
                                <option key={s.id} value={s.id}>
                                    {s.name}
                                    {s.live ? ' (live)' : ''}
                                </option>
                            ))}
                        </select>
                    </label>
                )}
            </div>

            <div className='match-filters__group'>
                <span className='match-filters__label'>
                    Heroes <span className='match-filters__cap'>up to {maxHeroes}</span>
                </span>
                <div className='match-filters__chips'>
                    {heroes.map((pick, index) => {
                        const option = options?.heroes.find((h) => h.base === pick.base);
                        const portrait = (
                            option?.variants.find((v) => v.hero === pick.hero) ??
                            option?.variants[0]
                        )?.portrait;
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
                                    <select
                                        className='chip-filter__variant'
                                        aria-label={`${formatHero(pick.base)} variant`}
                                        value={pick.hero ?? ''}
                                        onChange={(e) =>
                                            setHeroes(
                                                heroes.map((h) =>
                                                    h.base === pick.base
                                                        ? {
                                                              base: h.base,
                                                              hero: e.target.value || undefined,
                                                          }
                                                        : h,
                                                ),
                                            )
                                        }
                                    >
                                        <option value=''>
                                            Any variant
                                            {option ? ` (${formatNumber(option.count)})` : ''}
                                        </option>
                                        {pick.hero &&
                                            !option?.variants.some((v) => v.hero === pick.hero) && (
                                                <option value={pick.hero}>
                                                    {formatHero(pick.hero)} (0)
                                                </option>
                                            )}
                                        {option?.variants.map((v) => (
                                            <option key={v.hero} value={v.hero}>
                                                {v.hero === pick.base
                                                    ? 'Classic'
                                                    : formatHero(v.hero)}{' '}
                                                ({formatNumber(v.count)})
                                            </option>
                                        ))}
                                    </select>
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
                        <select
                            className='select match-filters__add'
                            value=''
                            aria-label='Add a hero'
                            onChange={(e) =>
                                e.target.value && setHeroes([...heroes, { base: e.target.value }])
                            }
                        >
                            <option value=''>
                                {heroes.length ? '+ Opponent hero' : '+ Add hero'}
                            </option>
                            {options?.heroes
                                .filter(
                                    (h) => h.count > 0 && !heroes.some((p) => p.base === h.base),
                                )
                                .map((h) => (
                                    <option key={h.base} value={h.base}>
                                        {formatHero(h.base)} ({formatNumber(h.count)})
                                    </option>
                                ))}
                        </select>
                    )}
                </div>
            </div>

            <div className='match-filters__group'>
                <span className='match-filters__label'>
                    Towers{' '}
                    <span className='match-filters__cap'>up to {maxTowers}, all in the match</span>
                </span>
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
                        <select
                            className='select match-filters__add'
                            value=''
                            aria-label='Add a tower'
                            onChange={(e) =>
                                e.target.value && setTowers([...towers, e.target.value])
                            }
                        >
                            <option value=''>+ Add tower</option>
                            {options?.towers
                                .filter((t) => t.count > 0 && !towers.includes(t.tower))
                                .map((t) => (
                                    <option key={t.tower} value={t.tower}>
                                        {formatLabel(t.tower)} ({formatNumber(t.count)})
                                    </option>
                                ))}
                        </select>
                    )}
                </div>
            </div>

            <p className='match-filters__hint'>
                Lists only show what exists together with your other filters, with the number of
                matches.
            </p>

            <div className='match-filters__row'>
                <label className='match-filters__field match-filters__field--map'>
                    <span className='match-filters__label'>Map</span>
                    <select
                        className='select'
                        value={query.map ?? ''}
                        onChange={(e) => onChange({ map: e.target.value || undefined })}
                    >
                        <option value=''>Any map</option>
                        {query.map && !options?.maps.some((m) => m.key === query.map) && (
                            <option value={query.map}>{query.map} (0)</option>
                        )}
                        {options?.maps
                            .slice()
                            .sort((a, b) => formatMap(a.map).localeCompare(formatMap(b.map)))
                            .map((m) => (
                                <option key={m.key} value={m.key}>
                                    {formatMap(m.map)} ({formatNumber(m.count)})
                                </option>
                            ))}
                    </select>
                </label>
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
