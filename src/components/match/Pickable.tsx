import type { MatchPick } from '@/types/match';

export default function Pickable({
    pick,
    onPick,
    className,
    children,
}: {
    pick: MatchPick;
    onPick?: ((pick: MatchPick) => void) | undefined;
    className: string;
    children: string;
}) {
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
