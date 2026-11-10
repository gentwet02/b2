import { useMemo } from 'react';
import ControlGroup from '@/components/controls/ControlGroup';
import Dropdown from '@/components/dropdown/Dropdown';
import useClans from '@/hooks/queries/useClans';
import type { MetClan } from '@/types/compare';
import { formatNumber, plural } from '@/utils/format';
import { formatRecord, gamesOf } from '@/utils/record';

interface ClanPickerProps {
    /** 'Clan', or what the clan is on its side ('Opposing clan') */
    label: string;
    value: string | undefined;
    /** the other side's clan: not offered */
    other?: string | undefined;
    /** the picked clan's name, when the list doesn't have it */
    name?: string | undefined;
    /**
     * The other side is picked: only the clans it met are offered, with its record against
     * each (`clans` undefined: not known yet).
     */
    met?: { clans: MetClan[] | undefined; loading: boolean } | undefined;
    onSelect: (clanId: string) => void;
}

/**
 * A side's clan: the clans with players the server knows, the most known players first; or,
 * once the other side is picked, the clans it met, the most games first.
 */
export default function ClanPicker(props: ClanPickerProps) {
    const { label, value, other, name, met, onSelect } = props;

    const clans = useClans(!met);
    const loading = met ? met.loading : clans.isLoading;
    const options = useMemo(() => {
        const list = met
            ? (met.clans ?? []).map((c) => {
                  const games = gamesOf(c.record);
                  const played = `${formatNumber(games)} ${plural(games, 'game')}`;
                  return {
                      value: c.id,
                      label: `${c.name} · ${played} · ${formatRecord(c.record)}`,
                      searchLabel: c.name,
                  };
              })
            : (clans.data ?? [])
                  .filter((c) => c.id !== other)
                  .map((c) => ({
                      value: c.id,
                      label: `${c.name} · ${formatNumber(c.known)} ${plural(c.known, 'player')}`,
                      searchLabel: c.name,
                  }));
        if (value && !list.some((o) => o.value === value)) {
            const shown = name ?? 'Selected clan';
            list.unshift({
                value,
                label: met?.clans ? `${shown} · never met` : shown,
                searchLabel: name ?? '',
            });
        }
        return list;
    }, [clans.data, met, value, other, name]);

    return (
        <ControlGroup label={label} grow>
            <Dropdown
                className='controls__player'
                variant='compact'
                options={options}
                value={value ?? ''}
                searchable
                disabled={loading && !value}
                placeholder={
                    loading
                        ? met
                            ? 'Loading the clans met…'
                            : 'Loading the clans…'
                        : !met && clans.error
                          ? "Couldn't load the clans"
                          : options.length
                            ? 'Pick a clan'
                            : 'No clan met'
                }
                aria-label={label}
                noResultsText='No clan with that name'
                onSelect={onSelect}
            />
        </ControlGroup>
    );
}
