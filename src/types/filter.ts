/** A chip list's exclusions: what's left out, how many can be, and the change. */
export interface ChipExclusion<T> {
    items: T[];
    max: number;
    onChange: (next: T[]) => void;
}
