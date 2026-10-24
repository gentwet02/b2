import type { ReactNode } from 'react';

/** wins, losses, draws (always from the profile player's side in head to head) */
export type Wld = [number, number, number];

/** A map key, a hero, a tower or a loadout key ("Quincy|Alchemist,Druid,Ninja") with its record. */
export interface RecordRow {
    key: string;
    record: Wld;
}

/** An extra column of a RecordTable. */
export interface RecordColumn<T> {
    title: string;
    render: (row: T) => ReactNode;
    /** the column's first order (the header becomes a sort button; a second click reverses it) */
    sort?: (a: T, b: T) => number;
    numeric?: boolean;
    className?: string;
}

/** RecordTable's sort: a built-in column, the label, or an extra column by index. */
export type RecordSortKey = 'games' | 'rate' | 'none' | 'label' | `col:${number}`;

export interface RecordSortState {
    key: RecordSortKey;
    /** reversed: the opposite of the column's first order */
    reversed: boolean;
}
