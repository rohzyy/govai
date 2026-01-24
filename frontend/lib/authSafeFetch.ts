import { getAuth } from './authState'
import { SafeApiResponse } from './safeFetch'; // Re-use type if possible, or define locally

export async function authSafeFetch<T = any>(
    url: string,
    options: RequestInit = {},
    requiredRole?: 'ADMIN' | 'OFFICER'
): Promise<SafeApiResponse<T> & { reason?: string }> {
    try {
        const { authReady, user } = getAuth()

        // 🔒 Wait until auth is ready (or fail safely if this call cant wait)
        // Ideally we would await a promise if logic required waiting, 
        // but per prompt requirements we return safe failure.
        if (!authReady) {
            // In a real app we might retry, but prompt asks for this:
            return { success: false, data: null, reason: 'AUTH_NOT_READY' }
        }

        // 🔒 Require login
        if (!user) {
            return { success: false, data: null, reason: 'NOT_AUTHENTICATED' }
        }

        // 🔒 Role guard
        if (requiredRole && user.role !== requiredRole) {
            return { success: false, data: null, reason: 'FORBIDDEN' }
        }

        // Add Auth Header
        const token = localStorage.getItem('access_token');
        if (!token) {
            return { success: false, data: null, reason: 'NO_TOKEN' }
        }

        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                ...(options.headers || {})
            },
            credentials: 'include' // CRITICAL: Send HttpOnly Cookies as backup
        }).catch(err => {
            console.error(`[AuthSafeFetch] Network error for ${url}:`, err);
            return null;
        });

        if (!res) {
            return { success: false, data: null, reason: 'NETWORK_ERROR' };
        }

        if (!res.ok) {
            // Check for JSON error details first
            let errorDetail = '';
            try {
                const errorBody = await res.json();
                if (errorBody && errorBody.detail) {
                    errorDetail = `: ${errorBody.detail}`;
                }
            } catch (e) {
                // Ignore parsing error
            }

            // Handle 401/403 specifically if needed, but generic error per prompt
            if (res.status === 401) return { success: false, data: null, reason: 'UNAUTHORIZED' };
            if (res.status === 403) return { success: false, data: null, reason: 'FORBIDDEN' };

            // Return specific error if available
            return { success: false, data: null, reason: `API_ERROR_${res.status}${errorDetail}` }
        }

        const data = await res.json().catch(() => null)

        // Check backend success flag pattern if it exists (Our API returns { success: boolean })
        if (data && typeof data.success === 'boolean' && !data.success) {
            return { success: false, data: data.data || null, reason: data.safeMessage || 'API_LOGIC_FAILURE' }
        }

        console.log(`[AuthSafeFetch] Success for ${url}. Data Type: ${Array.isArray(data) ? 'Array' : typeof data}`);
        return { success: true, data }
    } catch (err) {
        console.error('AUTH_SAFE_FETCH_ERROR:', err)
        return { success: false, data: null, reason: 'FETCH_FAILED' }
    }
}
