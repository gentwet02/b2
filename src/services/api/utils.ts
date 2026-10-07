import type { ApiResponse, BaseApiResponse } from '@/types/api';

/**
 * Set VITE_API_URL in .env to point at another server.
 * Defaults: localhost:3000 in dev, same origin in production.
 */
const API_URL =
    import.meta.env.VITE_API_URL ?? (import.meta.env.DEV ? 'http://localhost:3000' : '');

/** The server sends errors either as a string or as { message }. */
function readError(value: unknown): string | null {
    if (!value) return null;
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && 'message' in value) {
        return String((value as { message: unknown }).message);
    }
    return String(value);
}

export async function getFromApi<T extends BaseApiResponse>(
    endPoint: string,
): Promise<ApiResponse<T>> {
    let response: Response;
    try {
        response = await fetch(`${API_URL}/${endPoint}`);
    } catch {
        return {
            status: 0,
            success: false,
            message: `Can't reach the server at ${API_URL || window.location.origin}. Check that it's running.`,
            error: 'network',
            data: null,
        };
    }

    let data: T | null = null;
    try {
        data = (await response.json()) as T;
    } catch {
        // empty or non-JSON body, handled below
    }

    const error = readError(data?.error);
    const message = readError(data?.message);

    return {
        status: response.status,
        success: response.ok && data !== null,
        message: response.ok ? message : (message ?? error ?? `Server answered ${response.status}`),
        error,
        data: response.ok ? data : null,
    };
}

/** Turns a failed ApiResponse into an Error carrying the server's message. */
export function toError(response: ApiResponse<unknown>, fallback: string): Error {
    return new Error(response.message ?? response.error ?? fallback);
}
