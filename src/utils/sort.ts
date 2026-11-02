/** A–Z comparator on a row's text, numbers in order ("Season 9" before "Season 10"). */
export function byText<T>(text: (row: T) => string) {
    return (a: T, b: T) =>
        text(a).localeCompare(text(b), undefined, { sensitivity: 'base', numeric: true });
}
