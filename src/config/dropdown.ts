import type { DropdownVariant } from '@/types/dropdown';

/** Options past this count make the dropdown searchable by default. */
export const DROPDOWN_SEARCH_THRESHOLD = 8;

/** Chevron size per variant, in px. */
export const DROPDOWN_ICON_SIZES: Record<DropdownVariant, number> = {
    default: 16,
    compact: 12,
    pill: 10,
};
