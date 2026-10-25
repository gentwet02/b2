/**
 * Variants apart or together, in the URL so a shared link shows the same thing.
 * Both apart by default: only `false` is ever in the URL.
 */
export interface SplitSearch {
    /** false: classic and reversed maps together */
    splitMaps?: false | undefined;
    /** false: hero variants ("Cyber Quincy") together with their base hero */
    splitHeroes?: false | undefined;
}
