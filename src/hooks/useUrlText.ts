import { useEffect, useState } from 'react';
import useDebouncedValue from '@/hooks/useDebouncedValue';

/**
 * A text box bound to a URL param: the param updates once typing pauses,
 * and the box follows the URL when it changes by itself (Back, Clear filters).
 */
export default function useUrlText(
    value: string | undefined,
    set: (value: string | undefined) => void,
    delay = 300,
) {
    const [text, setText] = useState(value ?? '');
    const debounced = useDebouncedValue(text.trim(), delay);
    useEffect(() => {
        if (debounced !== (value ?? '')) set(debounced || undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debounced]);
    // the URL changed by itself: follow it (set while rendering, no extra effect pass)
    const [prevValue, setPrevValue] = useState(value);
    if (value !== prevValue) {
        setPrevValue(value);
        if ((value ?? '') !== debounced) setText(value ?? '');
    }
    return [text, setText] as const;
}
