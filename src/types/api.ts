export interface BaseApiResponse {
    message?: string | null;
    error?: string | null;
}

export interface ApiResponse<T> {
    status: number;
    success: boolean;
    message: string | null;
    error: string | null;
    data: T | null;
}
