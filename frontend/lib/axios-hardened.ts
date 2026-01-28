import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const isDev = process.env.NODE_ENV === 'development' || true; // Force true for demonstration if needed

/**
 * HARDENED AXIOS INSTANCE
 * 
 * Specifically designed to eliminate generic "Network Error" messages 
 * by performing heuristics on connection failures.
 */
const hardenedApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000',
    timeout: 8000,
});

// 1. REQUEST INTERCEPTOR: Logging & Pre-flight Diagnostics
hardenedApi.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const fullUrl = `${config.baseURL}${config.url}`;

    if (isDev) {
        console.group(`🌐 [API REQUEST] ${config.method?.toUpperCase()} ${config.url}`);
        console.log(`Resolved URL: ${fullUrl}`);
        console.log(`Request Headers:`, config.headers);
        console.groupEnd();
    }

    // Store metadata for the response interceptor error categorization
    (config as any)._startTime = Date.now();
    return config;
});

// 2. RESPONSE INTERCEPTOR: Failure Categorization
hardenedApi.interceptors.response.use(
    (response) => {
        if (isDev) {
            console.log(`✅ [API RESPONSE] ${response.status} from ${response.config.url}`);
        }
        return response;
    },
    async (error: AxiosError) => {
        const config = error.config as any;
        const duration = config ? Date.now() - config._startTime : 0;

        // If there is no response, it's a network-level failure
        if (!error.response) {
            let errorType = "NETWORK_FAILURE";
            let errorMessage = "Generic Network Error";
            let diagnosticSuggestion = "No additional info available.";

            if (error.code === 'ECONNABORTED') {
                errorType = "TIMEOUT";
                errorMessage = "Request Timeout";
                diagnosticSuggestion = `The server at ${config.baseURL} took longer than ${config.timeout}ms to respond.`;
            } else if (error.message === 'Network Error') {
                // HEURISTIC: Why did the network fail?

                // Case A: HTTPS/HTTP Mismatch (Mixed Content)
                const isHttpsMismatch = typeof window !== 'undefined' &&
                    window.location.protocol === 'https:' &&
                    config.baseURL?.startsWith('http://');

                if (isHttpsMismatch) {
                    errorType = "MIXED_CONTENT";
                    errorMessage = "Mixed Content Blocked (HTTPS/HTTP Mismatch)";
                    diagnosticSuggestion = "Safety policy blocks HTTP calls from HTTPS pages. Use an HTTPS backend or a secure proxy.";
                } else {
                    // Case B & C: Distinction between CORS and Server Down
                    // We attempt a 'no-cors' fetch. If this fails, the server is truly down/wrong port.
                    // If it succeeds, the server is up but CORS headers are missing/wrong.
                    try {
                        await fetch(config.baseURL + '/', { mode: 'no-cors' });
                        errorType = "CORS_ERROR";
                        errorMessage = "CORS Policy Violation";
                        diagnosticSuggestion = `The server at ${config.baseURL} is UP but rejected this request's Origin (${typeof window !== 'undefined' ? window.location.origin : 'unknown'}).`;
                    } catch (e) {
                        errorType = "SERVER_UNREACHABLE";
                        errorMessage = "Server Unreachable / Wrong Port";
                        diagnosticSuggestion = `No connection could be made to ${config.baseURL}. Verify the service is running and the port is correct.`;
                    }
                }
            }

            // Construct the hardened error
            const hardenedError = new Error(`[${errorType}] ${errorMessage}`) as any;
            hardenedError.diagnostic = diagnosticSuggestion;
            hardenedError.originalError = error;
            hardenedError.url = `${config.baseURL}${config.url}`;
            hardenedError.type = errorType;

            if (isDev) {
                console.group(`❌ [HARDENED NETWORK ERROR] ${errorType}`);
                console.error(`Message: ${errorMessage}`);
                console.error(`Diagnostic: ${diagnosticSuggestion}`);
                console.error(`Endpoint: ${hardenedError.url}`);
                console.groupEnd();
            }

            return Promise.reject(hardenedError);
        }

        return Promise.reject(error);
    }
);

export default hardenedApi;
