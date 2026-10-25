import { useNavigate, useSearch } from '@tanstack/react-router';
import { SPLIT_HEROES_DEFAULT, SPLIT_MAPS_DEFAULT } from '@/config/variants';
import type { SplitSearch } from '@/types/variants';

/**
 * Variants apart or together, kept in the URL (?splitMaps=false, ?splitHeroes=false) so a
 * shared link shows the same thing. Both on by default; works on any page whose route
 * parses them (stats, compare, profile).
 */
function useSplitSearch() {
    const search: SplitSearch = useSearch({ strict: false });
    const navigate = useNavigate();
    const set = (next: SplitSearch) =>
        void navigate({
            to: '.',
            search: (prev: Record<string, unknown>) => ({ ...prev, ...next }),
            replace: true,
            resetScroll: false,
        });
    return { search, set };
}

/** Classic and reversed maps apart (the default), or together. */
export function useSplitMaps() {
    const { search, set } = useSplitSearch();
    const value = search.splitMaps ?? SPLIT_MAPS_DEFAULT;
    return [value, (on: boolean) => set({ splitMaps: on ? undefined : false })] as const;
}

/** Hero variants ("Cyber Quincy") apart in the loadouts (the default), or together. */
export function useSplitHeroes() {
    const { search, set } = useSplitSearch();
    const value = search.splitHeroes ?? SPLIT_HEROES_DEFAULT;
    return [value, (on: boolean) => set({ splitHeroes: on ? undefined : false })] as const;
}

/** The current options, to carry them over in links to another page. */
export function useSplitParams(): SplitSearch {
    const { search } = useSplitSearch();
    return { splitMaps: search.splitMaps, splitHeroes: search.splitHeroes };
}
