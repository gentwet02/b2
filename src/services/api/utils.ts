import type { ApiResponse, BaseApiResponse } from '@/types/api';

const API_CONFIG = {
    LOCAL_URL: 'http://localhost:3000',
    SERVER_URL: '',
    HEADERS: {
        'Content-Type': 'application/json',
    },
};

const API_URL = import.meta.env.DEV ? API_CONFIG.LOCAL_URL : API_CONFIG.SERVER_URL;

const connectionError = {
    success: false,
    status: 500,
    message: 'Failed to connect with server',
} as const;

function responseDetails<T extends BaseApiResponse>(response: Response, data: T): ApiResponse<T> {
    return {
        status: response.status,
        success: response.ok,
        message: !response.ok ? data.message || null : null,
        error: response.ok ? data.error || null : null,
        data: response.ok ? data : null,
    };
}

export async function getFromApi<T extends BaseApiResponse>(
    endPoint: string
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_URL}/${endPoint}`);
        const data: T = await response.json();
        return responseDetails<T>(response, data);
    } catch {
        return connectionError as ApiResponse<T>;
    }
}
