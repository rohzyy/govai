/**
 * ZERO-CRASH FETCH WRAPPER
 * 
 * Rules:
 * 1. NEVER throws an error
 * 2. NEVER returns null/undefined
 * 3. ALWAYS returns { success, data }
 * 
 * Usage:
 * const { success, data } = await safeFetch('/api/endpoint');
 */

export interface SafeApiResponse<T = any> {
    success: boolean;
    data: T | null;
    error?: string;
    status?: number;
}

export async function safeFetch<T = any>(
    url: string,
    options?: RequestInit
): Promise<SafeApiResponse<T>> {
    try {
        const res = await fetch(url, options).catch(err => {
            console.error(`[SafeFetch] Network error for ${url}:`, err);
            return null;
        });

        // Network failure or fetch crash
        if (!res) {
            return {
                success: false,
                data: null,
                error: 'NETWORK_ERROR'
            };
        }

        // Try parsing JSON regardless of status
        // Some APIs return 400/500 with valid JSON error details
        let data = null;
        try {
            data = await res.json();
        } catch (jsonError) {
            console.warn(`[SafeFetch] JSON parse failed for ${url}`, jsonError);
            return {
                success: false,
                data: null,
                error: 'INVALID_JSON',
                status: res.status
            };
        }

        // Determine success based on HTTP status AND payload structure
        // We expect our APIs to return { success: true, ... }
        const success = res.ok && data && (data.success === true || data.success === undefined);

        return {
            success,
            data: data,
            status: res.status,
            error: success ? undefined : (data?.error || data?.safeMessage || `HTTP_${res.status}`)
        };

    } catch (fatalError) {
        console.error(`[SafeFetch] FATAL error for ${url}:`, fatalError);
        return {
            success: false,
            data: null,
            error: 'FATAL_CLIENT_ERROR'
        };
    }
}
