export type DropdownValue = string | number;

export interface DropdownItem<V extends DropdownValue> {
    value: V;
    label: string;
    /** also found by these when searching, without being shown (e.g. a player's old names) */
    keywords?: readonly DropdownKeyword[] | undefined;
}

/** A hidden search term of an option, and what it is ("old name"), shown when it matched. */
export interface DropdownKeyword {
    text: string;
    note?: string | undefined;
}

/** An option in the open list: `matched` is the keyword the search found it by. */
export interface DropdownShownItem<V extends DropdownValue> extends DropdownItem<V> {
    matched?: DropdownKeyword | undefined;
}

/** A plain value is its own label. */
export type DropdownOption<V extends DropdownValue> = V | DropdownItem<V>;

export type DropdownVariant = 'default' | 'compact' | 'pill';
