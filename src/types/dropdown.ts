export type DropdownValue = string | number;

export interface DropdownItem<V extends DropdownValue> {
    value: V;
    label: string;
}

/** A plain value is its own label. */
export type DropdownOption<V extends DropdownValue> = V | DropdownItem<V>;

export type DropdownVariant = 'default' | 'compact' | 'pill';
