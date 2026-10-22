import { useSyncExternalStore } from 'react';

interface StoredValueOptions<T> {
    /** localStorage key */
    key: string;
    /** used when nothing (valid) is stored, and when storage is blocked */
    fallback: T;
    /** stored string → value; return `fallback` for anything unexpected */
    read: (raw: string) => T;
    /** value → string to store, or null to remove the key */
    write: (value: T) => string | null;
    /** follow changes made in other tabs */
    syncTabs?: boolean;
}

/**
 * One value kept in localStorage and shared by every component using it (and, with `syncTabs`,
 * every tab). Private mode or blocked storage: it still works, for this visit only.
 */
export function createStoredValue<T>({
    key,
    fallback,
    read,
    write,
    syncTabs,
}: StoredValueOptions<T>) {
    const load = (): T => {
        try {
            const raw = localStorage.getItem(key);
            return raw === null ? fallback : read(raw);
        } catch {
            return fallback; // private mode, blocked storage, bad JSON
        }
    };

    let current = load();
    const listeners = new Set<() => void>();

    const set = (next: T) => {
        current = next;
        try {
            const raw = write(next);
            if (raw === null) localStorage.removeItem(key);
            else localStorage.setItem(key, raw);
        } catch {
            // still works for this visit
        }
        listeners.forEach((listener) => listener());
    };

    const subscribe = (listener: () => void) => {
        listeners.add(listener);
        const onStorage = (event: StorageEvent) => {
            if (event.key !== key) return;
            current = load();
            listener();
        };
        if (syncTabs) window.addEventListener('storage', onStorage);
        return () => {
            listeners.delete(listener);
            if (syncTabs) window.removeEventListener('storage', onStorage);
        };
    };

    const get = () => current;
    const useValue = () => useSyncExternalStore(subscribe, get, get);

    return { get, set, useValue };
}
