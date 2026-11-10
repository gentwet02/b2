import { bem } from '@/utils/className';

interface LiveTagProps {
    /** next to a card's title rather than a page's */
    small?: boolean | undefined;
}

/** The red "Live" tag with its pulsing dot, after the name of the season being played. */
export default function LiveTag(props: LiveTagProps) {
    const { small } = props;

    return <span className={bem('live-tag', small && 'small')}>Live</span>;
}
