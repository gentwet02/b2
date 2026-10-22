import { API_URL } from '@/config/api';
import type { ApiResponse, BaseApiResponse } from '@/types/api';

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

/** The data of a successful response, or throws with the server's message (for useQuery). */
export async function fetchData<T extends BaseApiResponse>(
    request: Promise<ApiResponse<T>>,
    fallback: string,
): Promise<T> {
    const response = await request;
    if (!response.success || !response.data) throw toError(response, fallback);
    return response.data;
}

type ParamValue = string | number | boolean | null | undefined;

/** "path?a=1&b=2", leaving out empty values; `true` is sent as "1". */
export function withQuery(path: string, params: Record<string, ParamValue>): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === '' || value === false) continue;
        search.set(key, value === true ? '1' : String(value));
    }
    const query = search.toString();
    return query ? `${path}?${query}` : path;
}
