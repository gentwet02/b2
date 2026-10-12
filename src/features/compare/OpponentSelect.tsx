import Dropdown from '@/components/dropdown/Dropdown';
import type { RankedPlayer } from '@/features/LeaderboardScore';
import type { OpponentSlot } from '@/hooks/useOpponentSlots';
import { useMemo } from 'react';

interface OpponentSelectProps {
    slot: OpponentSlot;
    /** leaderboard the options come from */
    players: RankedPlayer[];
    /** the profile player and the other slots: not offered */
    taken: Set<string>;
    /** name of the slot's player when they aren't in the leaderboard */
    fallbackName?: string | undefined;
    onChange: (id: string | null) => void;
}

const optionLabel = (p: RankedPlayer) =>
    `#${p.rank} ${p.realName || p.name}${p.realName && p.realName !== p.name ? ` (${p.name})` : ''}`;

/** One opponent slot: a searchable select, and a way back to the default player once replaced. */
export default function OpponentSelect(props: OpponentSelectProps) {
    const { slot, players, taken, fallbackName, onChange } = props;

    const options = useMemo(() => {
        const list = players
            .filter((p) => p.id === slot.id || !taken.has(p.id))
            .map((p) => ({ value: p.id, label: optionLabel(p) }));
        // a pick from another season's leaderboard still needs a label
        if (!list.some((o) => o.value === slot.id)) {
            list.unshift({ value: slot.id, label: fallbackName ?? 'Unknown player' });
        }
        return list;
    }, [players, taken, slot.id, fallbackName]);

    return (
        <div className={`opponent-select${slot.custom ? ' opponent-select--custom' : ''}`}>
            <Dropdown
                className='opponent-select__dropdown'
                variant='compact'
                options={options}
                value={slot.id}
                searchable
                aria-label={`Opponent ${slot.index + 1}`}
                noResultsText='No player with that name'
                onSelect={(id) => onChange(id)}
            />
            {slot.custom && (
                <button
                    type='button'
                    className='opponent-select__reset'
                    title='Back to the top 10 player of this slot'
                    aria-label={`Put back the top 10 player in slot ${slot.index + 1}`}
                    onClick={() => onChange(null)}
                >
                    ↺
                </button>
            )}
        </div>
    );
}
