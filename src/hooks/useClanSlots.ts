import { CLAN_H2H_SLOTS } from '@/config/compare';
import { STORAGE_KEYS } from '@/config/storage';
import { createStoredValue } from '@/hooks/createStoredValue';
import { parseClanId } from '@/utils/search';

/**
 * Slots of the clan head to head card the visitor replaced: slot index → clan id (null = the
 * default top clan). Kept in the browser, so the same clans follow them from clan page to
 * clan page and across tabs. (The players' ones: useCompareSlots.)
 */
type Overrides = readonly (string | null)[];

const NONE: Overrides = Array.from({ length: CLAN_H2H_SLOTS }, () => null);

function clean(value: unknown): Overrides {
    if (!Array.isArray(value)) return NONE;
    return NONE.map((_, i) => parseClanId(value[i]) ?? null);
}

const slots = createStoredValue<Overrides>({
    key: STORAGE_KEYS.clanSlots,
    fallback: NONE,
    read: (raw) => clean(JSON.parse(raw)),
    write: (value) => (value === NONE ? null : JSON.stringify(value)),
    syncTabs: true,
});

function save(next: Overrides) {
    slots.set(next.some(Boolean) ? clean(next) : NONE);
}

/** Replace slot `index` with `id`; null puts the default clan back. */
export function setClanSlot(index: number, id: string | null) {
    save(slots.get().map((value, i) => (i === index ? id : value)));
}

export function resetClanSlots() {
    save(NONE);
}

export default function useClanSlots() {
    return slots.useValue();
}
