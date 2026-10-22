import type { MatchPick } from '@/types/match';

interface PickableProps {
    pick: MatchPick;
    onPick?: ((pick: MatchPick) => void) | undefined;
    className: string;
    children: string;
}

export default function Pickable(props: PickableProps) {
    const { pick, onPick, className, children } = props;

    if (!onPick) return <span className={className}>{children}</span>;
    return (
        <button
            type='button'
            className={`${className} match-card__pick`}
            onClick={() => onPick(pick)}
            title={`Filter on ${children}`}
        >
            {children}
        </button>
    );
}
