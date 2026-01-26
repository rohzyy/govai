import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000', // Standard Port
    withCredentials: true, // IMPORTANT: Sends Cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Helper to read CSRF Cookie
function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}

// Request Interceptor: Attach Token from LocalStorage
api.interceptors.request.use((config) => {
    // SKIP Auth Header for Auth Routes (Prevents 401 loops with bad tokens)
    const publicRoutes = ['/auth/google', '/auth/login', '/auth/register', '/auth/refresh'];
    if (config.url && publicRoutes.some(route => config.url?.includes(route))) {
        return config;
    }

    // 1. Try LocalStorage (Most reliable for MVP)
    let token: string | null | undefined = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    // 2. Fallback to Cookie
    if (!token) {
        token = getCookie('access_token');
    }

    // DEBUG: Confirm Token Attachment
    if (token) {
        console.log(`[API] Attaching Bearer Token: ${token.substring(0, 10)}...`);
        config.headers['Authorization'] = `Bearer ${token}`;
    } else {
        console.warn("[API] No Access Token found in LocalStorage or Cookies");
    }

    const csrfToken = getCookie('csrf_token');
    if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken;
    }

    return config;
});

// SILENCE COOP/COEP WARNINGS (Browser-level noise after successful OAuth)
if (typeof window !== 'undefined') {
    const originalWarn = console.warn;
    console.warn = (...args) => {
        if (args[0]?.toString().includes("Cross-Origin-Opener-Policy policy would block window.postMessage")) return;
        originalWarn.apply(console, args);
    };
}

// Response Interceptor: Handle 401 & Auto-Refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // SKIP Refresh/Log for Auth Routes (Login, Register, Google OAuth)
        // prevents "401 ERROR DETAILS" noise on failed login
        const isAuthRequest = originalRequest.url?.includes('/auth/') || originalRequest.url?.includes('/login');

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
            console.error("401 ERROR DETAILS:", error.response.data); // DEBUG LOG
            originalRequest._retry = true;

            try {
                // Attempt Refresh
                const refreshResponse = await axios.post('http://localhost:8000/auth/refresh', {}, { withCredentials: true });

                // CRITICAL: Update LocalStorage with new token immediately
                if (refreshResponse.data?.access_token) {
                    console.log("[API] Token refreshed. Updating LocalStorage.");
                    localStorage.setItem('access_token', refreshResponse.data.access_token);

                    // Update the header efficiently for the retry
                    originalRequest.headers['Authorization'] = `Bearer ${refreshResponse.data.access_token}`;
                }

                // Retry original request (Cookies are auto-sent)
                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed (Revoked or Expired) -> Logout
                if (typeof window !== 'undefined') {
                    await axios.post('http://localhost:8000/auth/logout', {}, { withCredentials: true });
                    window.location.href = '/login';
                }
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
