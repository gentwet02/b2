import type { DropdownKeyword } from '@/types/dropdown';
import { cx } from '@/utils/className';

interface FoundAsProps {
    /** the name the search found the player by */
    found: DropdownKeyword;
    className?: string | undefined;
}

/** "Found as Bob (old name)": why a search result shows under another name. */
export default function FoundAs(props: FoundAsProps) {
    const { found, className } = props;

    return (
        <span
            className={cx('found-as', className)}
            title={`This player was found by ${found.note ? `their ${found.note}` : 'another name'}`}
        >
            Found as <strong>{found.text}</strong>
            {found.note && ` (${found.note})`}
        </span>
    );
}
