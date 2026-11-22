/** Table defaults, when the page doesn't set them. */
export const TABLE_DEFAULT_PAGE_SIZE = 10;
export const TABLE_PAGE_SIZES = [5, 10, 25, 50];
/** A virtual table's row height (px) before it's measured: a leaderboard row with its avatar. */
export const TABLE_VIRTUAL_ROW_ESTIMATE = 61;
/** Rows rendered past each edge of the viewport, so a fast scroll doesn't show blank space. */
export const TABLE_VIRTUAL_OVERSCAN = 8;
/** A record table's row height (px) before it's measured (stats, compare). */
export const RECORD_TABLE_ROW_ESTIMATE = 39;
/** Record tables scroll in a box of a dozen rows: fewer spare rows needed. */
export const RECORD_TABLE_OVERSCAN = 6;
/**
 * Up to this many rows a record table renders them all: its columns keep one width while it
 * scrolls (a virtual table sizes them on the rows in view, a long name widens one as it passes).
 */
export const RECORD_TABLE_FULL_ROWS = 150;
