import { useCallback, useEffect, useRef } from 'react';

type Timeout = ReturnType<typeof setTimeout>;
type CallbackFunction = (...args: unknown[]) => void;

export default function useDebouncedCallback<T extends CallbackFunction>(
    callback: T,
    delay: number = 300,
    dependencies: React.DependencyList = []
): T {
    const timeoutRef = useRef<Timeout>(undefined);

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
            // Clear existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            // Set new timeout
            timeoutRef.current = setTimeout(() => {
                callback(...args);
            }, delay);
        }) as T,
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [callback, delay, ...dependencies]
    );
}
