import FilterChip from '@/components/filter-chips/FilterChip';
import { cx } from '@/utils/className';
import { sideTagLabel } from '@/utils/sideList';

interface SideTagsProps {
    /** what the list is, for screen readers: 'Players counted' */
    label: string;
    /** the side's list, as the URL's tags */
    tags: string[];
    /** the players, clans and ranges the side leaves out: red chips, after the list */
    excluded: string[];
    /** names of the players and clans, by id */
    names: Record<string, string>;
    onRemove: (tag: string) => void;
    onRemoveExcluded: (tag: string) => void;
}

/**
 * A side's chips: every player, clan and range counted together, then the ones left out,
 * each with its ×.
 */
export default function SideTags(props: SideTagsProps) {
    const { label, tags, excluded, names, onRemove, onRemoveExcluded } = props;

    return (
        <ul className={cx('filter-chips__list', 'stats-sides__tags')} aria-label={label}>
            {tags.map((tag) => (
                <FilterChip
                    key={tag}
                    name={sideTagLabel(tag, names)}
                    onRemove={() => onRemove(tag)}
                />
            ))}
            {excluded.map((tag) => (
                <FilterChip
                    key={`not-${tag}`}
                    name={sideTagLabel(tag, names)}
                    excluded
                    onRemove={() => onRemoveExcluded(tag)}
                />
            ))}
        </ul>
    );
}
