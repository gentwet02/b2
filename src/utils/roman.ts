const NUMERALS: [number, string][] = [
    //[1000, 'M'],
    //[900, 'CM'],
    //[500, 'D'],
    //[400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
];

/** 46 → "XLVI"; empty for anything below 1. */
export function toRoman(value: number): string {
    let n = Math.floor(value);
    let out = '';
    for (const [amount, numeral] of NUMERALS) {
        while (n >= amount) {
            out += numeral;
            n -= amount;
        }
    }
    return out;
}
