import type { Badge } from '@/types/profile';
import { medalLabel, medalNumeral } from '@/utils/badges';

interface MedalProps {
    badge: Badge;
    size?: 'sm' | 'md';
    className?: string;
}

/**
 * A season medal with its season's roman numeral on the ribbon, like in game. Read out as one
 * picture ("Season 46 medal: Top 50% of the Hall of Masters"): the numeral is only drawn.
 */
export default function Medal(props: MedalProps) {
    const { badge, size = 'md', className } = props;

    const numeral = medalNumeral(badge.season);
    const label = medalLabel(badge);

    return (
        <span
            className={`medal medal--${size}${className ? ` ${className}` : ''}`}
            title={label}
        >
            <span className='medal__art'>
                {badge.url ? (
                    <img className='medal__img' src={badge.url} alt={label} loading='lazy' />
                ) : (
                    <span className='medal__fallback' role='img' aria-label={label} />
                )}
                {numeral && (
                    <span
                        className='medal__season'
                        data-length={
                            numeral.length > 6 ? 'longer' : numeral.length > 4 ? 'long' : undefined
                        }
                        aria-hidden='true'
                    >
                        {numeral}
                    </span>
                )}
            </span>
        </span>
    );
}
