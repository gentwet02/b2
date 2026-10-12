import { COMPARE_SLOTS } from '@/config/compare';
import { useSyncExternalStore } from 'react';

/**
 * Slots the visitor replaced: slot index → user id (null = the default top 10 player).
 * Kept in the browser, so the same opponents follow them from profile to profile and across tabs.
 */
type Overrides = readonly (string | null)[];

const STORAGE_KEY = 'b2.compare.slots';
const USER_ID = /^[a-z0-9]{8,64}$/i;
const NONE: Overrides = Array.from({ length: COMPARE_SLOTS }, () => null);

function clean(value: unknown): Overrides {
    if (!Array.isArray(value)) return NONE;
    return NONE.map((_, i) => {
        const id: unknown = value[i];
        return typeof id === 'string' && USER_ID.test(id) ? id : null;
    });
}

function load(): Overrides {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? clean(JSON.parse(raw)) : NONE;
    } catch {
        return NONE; // private mode, blocked storage, bad JSON
    }
}

let current = load();
const listeners = new Set<() => void>();

function save(next: Overrides) {
    current = next.some(Boolean) ? clean(next) : NONE;
    try {
        if (current === NONE) localStorage.removeItem(STORAGE_KEY);
        else localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch {
        // still works for this visit
    }
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
        if (event.key !== STORAGE_KEY) return;
        current = load();
        listener();
    };
    window.addEventListener('storage', onStorage);
    return () => {
        listeners.delete(listener);
        window.removeEventListener('storage', onStorage);
    };
}

const snapshot = () => current;

/** Replace slot `index` with `id`; null puts the default player back. */
export function setCompareSlot(index: number, id: string | null) {
    save(current.map((value, i) => (i === index ? id : value)));
}

export function resetCompareSlots() {
    save(NONE);
}

export default function useCompareSlots() {
    return useSyncExternalStore(subscribe, snapshot, snapshot);
}
