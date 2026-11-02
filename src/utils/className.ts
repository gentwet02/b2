type Part = string | false | null | undefined;

/** A BEM block (or element) with its modifiers: "h2h-row h2h-row--open". */
export function bem(block: string, ...modifiers: Part[]) {
    return [block, ...modifiers.filter(Boolean).map((m) => `${block}--${m}`)].join(' ');
}

/**
 * Only the modifiers ("button--quiet"), or the block when there are none: for the blocks whose
 * styles select every class starting with their name ([class^='button']).
 */
export function mods(block: string, ...modifiers: Part[]) {
    const on = modifiers.filter(Boolean);
    return on.length ? on.map((m) => `${block}--${m}`).join(' ') : block;
}

/** Class names joined, the empty ones left out. */
export const cx = (...parts: Part[]) => parts.filter(Boolean).join(' ');
