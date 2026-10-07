import { useCallback, useEffect, useRef } from 'react';

type TimeoutId = ReturnType<typeof setTimeout>;
type CallbackFunction = (...args: unknown[]) => void;

interface UseThrottleParams<T extends CallbackFunction> {
    /** The function to be throttled */
    callback: T;
    /** Delay in milliseconds between function executions (default: 300) */
    delay?: number;
    /** Execute immediately on first call (default: true) */
    leading?: boolean;
    /** Execute again after delay if called during wait (default: false) */
    trailing?: boolean;
    /** React dependencies that should trigger recreation of the throttled function */
    dependencies?: React.DependencyList;
}

export function useThrottle<T extends CallbackFunction>({
    callback,
    delay = 300, // In milliseconds
    leading = true, // Execute immediately on first call
    trailing = false, // Execute again after delay if called during wait
    dependencies = [],
}: UseThrottleParams<T>): T {
    const timeoutRef = useRef<TimeoutId>(undefined);
    const lastExecutedRef = useRef<number>(0);
    const lastArgsRef = useRef<Parameters<T>>(undefined);
    const pendingRef = useRef<boolean>(false);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return useCallback(
        ((...args: Parameters<T>) => {
            const now = Date.now();
            const timeSinceLastExecution = now - lastExecutedRef.current;

            lastArgsRef.current = args;

            if (lastExecutedRef.current === 0 && leading) {
                // First call with leading enabled
                lastExecutedRef.current = now;
                callback(...args);
            } else if (timeSinceLastExecution >= delay) {
                // Enough time has passed since last execution
                if (leading) {
                    lastExecutedRef.current = now;
                    callback(...args);
                }
            }

            if (!pendingRef.current && trailing) {
                pendingRef.current = true;

                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }

                const remainingTime = Math.max(0, delay - timeSinceLastExecution);

                timeoutRef.current = setTimeout(() => {
                    if (timeSinceLastExecution < delay || !leading) {
                        lastExecutedRef.current = Date.now();
                        callback(...(lastArgsRef.current as Parameters<T>));
                    }
                    pendingRef.current = false;
                }, remainingTime);
            }
        }) as T,
        // disable eslint for the deconstruct unknown dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [callback, delay, leading, trailing, ...dependencies]
    );
}
