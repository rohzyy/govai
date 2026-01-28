import axios from 'axios';

/**
 * CANONICAL AXIOS INSTANCE
 * 
 * Prevents "Network Error" by:
 * 1. Using explicit IP (127.0.0.1) instead of localhost.
 * 2. Setting explicit headers and credentials.
 * 3. Providing clear error handling for network-level failures.
 */
const api = axios.create({
    // Use IP to avoid dual-stack (IPv4/IPv6) resolution delays or failures on Windows
    baseURL: 'http://127.0.0.1:8000',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest', // Helps identifying AJAX requests
    },
    timeout: 10000, // Reasonable timeout to prevent infinite hanging
});

/**
 * Google Login Helper
 * @param token - The id_token received from Google OAuth popup
 */
export const loginWithGoogle = async (token: string) => {
    try {
        console.log(`[API] Sending POST /auth/google with token: ${token.substring(0, 10)}...`);
        const response = await api.post('/auth/google', { token });
        return response.data;
    } catch (error: any) {
        if (!error.response) {
            // Error occurred BEFORE a response was received (Network Error)
            console.error("❌ CANONICAL NETWORK ERROR DETECTED");
            console.error("DIAGNOSIS:");
            console.error("1. Backend service at 127.0.0.1:8000 is DOWN.");
            console.error("2. Browser Extension (Adblocker) blocked the request.");
            console.error("3. OS Firewall blocked the outbound connection.");
        } else {
            console.error(`❌ API ERROR (${error.response.status}):`, error.response.data);
        }
        throw error;
    }
};

export default api;
