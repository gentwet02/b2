import { STORAGE_KEYS } from '@/config/storage';
import { createStoredValue } from '@/hooks/createStoredValue';

/**
 * Whether match cards put the searched or viewed player on the left, instead of the side Ninja
 * Kiwi recorded them on. Only changes how cards read, so it lives in the browser rather than in
 * the URL, and one setting covers every match list. Off by default.
 */
const keepSide = createStoredValue<boolean>({
    key: STORAGE_KEYS.keepSide,
    fallback: true,
    read: (raw) => raw === '1',
    write: (value) => (value ? '1' : null),
    syncTabs: true,
});

export const setKeepSide = (on: boolean) => keepSide.set(on);

export default function useKeepSide() {
    return keepSide.useValue();
}
