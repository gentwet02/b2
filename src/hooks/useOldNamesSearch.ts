import { STORAGE_KEYS } from '@/config/storage';
import { createStoredValue } from '@/hooks/createStoredValue';

/**
 * Whether the player pickers (stats, compare) also match the names players went by before.
 * Kept in the browser and shared by the pickers; off by default. The match history and the
 * leaderboard keep their toggle in the URL (`allNames`), so their links show the same results.
 */
const oldNamesSearch = createStoredValue<boolean>({
    key: STORAGE_KEYS.oldNamesSearch,
    fallback: false,
    read: (raw) => raw === '1',
    write: (value) => (value ? '1' : null),
    syncTabs: true,
});

export const setOldNamesSearch = (on: boolean) => oldNamesSearch.set(on);

export default function useOldNamesSearch() {
    return oldNamesSearch.useValue();
}
