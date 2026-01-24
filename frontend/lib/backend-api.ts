import axios, { AxiosInstance } from 'axios';

/**
 * Server-side ONLY Axios instance for Next.js API routes
 * DO NOT import this in client components!
 * 
 * This talks to the FastAPI backend at localhost:8000
 */

const BACKEND_URL = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';

const backendAPI: AxiosInstance = axios.create({
    baseURL: BACKEND_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
    // Note: withCredentials not needed here since we're server-to-server
});

// Request interceptor for logging (server-side)
backendAPI.interceptors.request.use((config) => {
    console.log(`[Backend API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
});

// Response interceptor for error handling
backendAPI.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[Backend API Error]:', error.message);
        if (error.response) {
            console.error('Response data:', error.response.data);
            console.error('Response status:', error.response.status);
        }
        throw error;
    }
);

export default backendAPI;
