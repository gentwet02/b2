import { useMemo, useState } from 'react';
import { Link } from '@tanstack/react-router';
import Dropdown from '@/components/dropdown/Dropdown';
import { ChevronDownIcon } from '@/components/icons';
import type { ClanSummary } from '@/types/clan';
import type { OpponentSlot } from '@/types/compare';
import { bem } from '@/utils/className';
import { formatNumber, plural } from '@/utils/format';

interface ClanSelectProps {
    slot: OpponentSlot;
    /** the slot's clan (undefined: its name isn't known yet) */
    clan: ClanSummary | undefined;
    /** the clans to pick from */
    clans: ClanSummary[];
    /** the page's clan and the other slots: not offered */
    taken: Set<string>;
    onChange: (id: string | null) => void;
}

/**
 * One clan slot: a strip of the clan's banner with its name on it and, at its end, an arrow
 * that swaps it for a searchable select (open, its text selected); next to it, a way back to
 * the default clan once replaced.
 */
export default function ClanSelect(props: ClanSelectProps) {
    const { slot, clan, clans, taken, onChange } = props;

    const [picking, setPicking] = useState(false);
    const name = clan?.name ?? 'Unknown clan';
    const known = clan && `${formatNumber(clan.known)} HoM ${plural(clan.known, 'player')}`;
    const options = useMemo(() => {
        const list = clans
            .filter((c) => c.id === slot.id || !taken.has(c.id))
            .map((c) => ({
                value: c.id,
                label: `${c.name} · ${formatNumber(c.known)} ${plural(c.known, 'player')}`,
                searchLabel: c.name,
            }));
        if (!list.some((o) => o.value === slot.id)) {
            list.unshift({ value: slot.id, label: name, searchLabel: name });
        }
        return list;
    }, [clans, taken, slot.id, name]);

    return (
        <div className={bem('clan-select', slot.custom && 'custom')}>
            {picking ? (
                <Dropdown
                    className='clan-select__dropdown'
                    variant='compact'
                    options={options}
                    value={slot.id}
                    searchable
                    openOnMount
                    aria-label={`Clan ${slot.index + 1}`}
                    noResultsText='No clan with that name'
                    onClose={() => setPicking(false)}
                    onSelect={onChange}
                />
            ) : (
                <div
                    className='clan-select__banner'
                    style={
                        clan?.bannerURL
                            ? { backgroundImage: `url("${clan.bannerURL}")` }
                            : undefined
                    }
                >
                    <Link
                        to='/clan/$clanId'
                        params={{ clanId: slot.id }}
                        className='clan-select__name'
                        title={clan ? `${name} · ${known}` : name}
                    >
                        {name}
                    </Link>
                    <button
                        type='button'
                        className='clan-select__toggle'
                        title='Pick another clan'
                        aria-label={`Replace ${name}`}
                        onClick={() => setPicking(true)}
                    >
                        <ChevronDownIcon width={14} height={14} aria-hidden='true' />
                    </button>
                </div>
            )}
            <span className='clan-select__aside'>
                {slot.custom && (
                    <button
                        type='button'
                        className='clan-select__reset'
                        title='Back to the top clan of this slot'
                        aria-label={`Put back the top clan in slot ${slot.index + 1}`}
                        onClick={() => {
                            setPicking(false);
                            onChange(null);
                        }}
                    >
                        ↺
                    </button>
                )}
            </span>
        </div>
    );
}
