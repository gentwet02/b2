import { useSyncExternalStore } from 'react';

/**
 * Head to head maps: classic and reversed versions apart, or together (the default).
 * One setting for every card on the page, remembered in this browser.
 */
const KEY = 'btdb2:splitReversedMaps';
const listeners = new Set<() => void>();

function read() {
    try {
        return localStorage.getItem(KEY) === '1';
    } catch {
        return false;
    }
}

let value = read();

function setSplitMaps(next: boolean) {
    value = next;
    try {
        localStorage.setItem(KEY, next ? '1' : '0');
    } catch {
        // private mode: kept for this visit only
    }
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export default function useSplitMaps() {
    const split = useSyncExternalStore(subscribe, () => value);
    return [split, setSplitMaps] as const;
}
