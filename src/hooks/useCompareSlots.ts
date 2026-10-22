import { COMPARE_SLOTS } from '@/config/compare';
import { STORAGE_KEYS } from '@/config/storage';
import { createStoredValue } from '@/hooks/createStoredValue';
import { parseUserId } from '@/utils/search';

/**
 * Slots the visitor replaced: slot index → user id (null = the default top 10 player).
 * Kept in the browser, so the same opponents follow them from profile to profile and across tabs.
 */
type Overrides = readonly (string | null)[];

const NONE: Overrides = Array.from({ length: COMPARE_SLOTS }, () => null);

function clean(value: unknown): Overrides {
    if (!Array.isArray(value)) return NONE;
    return NONE.map((_, i) => parseUserId(value[i]) ?? null);
}

const slots = createStoredValue<Overrides>({
    key: STORAGE_KEYS.compareSlots,
    fallback: NONE,
    read: (raw) => clean(JSON.parse(raw)),
    write: (value) => (value === NONE ? null : JSON.stringify(value)),
    syncTabs: true,
});

function save(next: Overrides) {
    slots.set(next.some(Boolean) ? clean(next) : NONE);
}

/** Replace slot `index` with `id`; null puts the default player back. */
export function setCompareSlot(index: number, id: string | null) {
    save(slots.get().map((value, i) => (i === index ? id : value)));
}

export function resetCompareSlots() {
    save(NONE);
}

export default function useCompareSlots() {
    return slots.useValue();
}
