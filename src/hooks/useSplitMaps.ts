import { COMPARE_SPLIT_MAPS_DEFAULT } from '@/config/compare';
import { STORAGE_KEYS } from '@/config/storage';
import { createStoredValue } from '@/hooks/createStoredValue';

/**
 * Head to head maps: classic and reversed versions apart (the default), or together.
 * One setting for every card on the page, remembered in this browser.
 */
const splitMaps = createStoredValue({
    key: STORAGE_KEYS.splitMaps,
    fallback: COMPARE_SPLIT_MAPS_DEFAULT,
    read: (raw) => raw === '1',
    write: (value) => (value ? '1' : '0'),
});

export default function useSplitMaps() {
    return [splitMaps.useValue(), splitMaps.set] as const;
}
