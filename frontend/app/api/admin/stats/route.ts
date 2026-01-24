import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

/**
 * CRASH-PROOF ADMIN STATS ROUTE
 * 
 * RULE: This route NEVER returns HTTP 500.
 * All failures return HTTP 200 with { success: false, ... }
 * This prevents Axios from throwing exceptions.
 */

// Default fallback data for graceful degradation
const FALLBACK_STATS = {
    total_complaints: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    rejected: 0,
    critical: 0,
    resolution_rate: 0,
    avg_resolution_time: 0,
    departments: [],
};

export async function GET(request: NextRequest) {
    // Outer try-catch: NOTHING escapes this
    try {
        // 1. Safely extract auth header
        let authHeader: string | null = null;
        try {
            authHeader = request.headers.get('authorization');
        } catch (headerError) {
            console.error('[ADMIN_STATS] Header extraction failed:', headerError);
            // Continue without auth - let backend handle it
        }

        const headers: Record<string, string> = {};
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        // 2. Attempt backend call with full error containment
        let backendData = null;
        let backendError = null;

        try {
            const response = await backendAPI.get('/admin/stats', { headers });

            // Validate response exists and has data
            if (response && response.data) {
                backendData = response.data;
            }
        } catch (apiError: any) {
            console.error('[ADMIN_STATS] Backend call failed:', apiError?.message || apiError);
            backendError = apiError;
        }

        // 3. SUCCESS PATH: Backend returned valid data
        if (backendData !== null) {
            return NextResponse.json({
                success: true,
                data: backendData,
                meta: { healthy: true, source: 'backend' }
            });
            // ^^^ HTTP 200 (default)
        }

        // 4. FAILURE PATH: Backend failed, return graceful degradation
        // Determine user-friendly error message
        let safeMessage = 'Unable to fetch statistics. Please try again.';
        let errorCode = 'BACKEND_ERROR';

        if (backendError?.code === 'ECONNREFUSED') {
            safeMessage = 'Backend service is starting up. Please wait a moment.';
            errorCode = 'BACKEND_UNAVAILABLE';
        } else if (backendError?.code === 'ETIMEDOUT') {
            safeMessage = 'Request timed out. Please try again.';
            errorCode = 'TIMEOUT';
        } else if (backendError?.response?.status === 401) {
            safeMessage = 'Session expired. Please login again.';
            errorCode = 'UNAUTHORIZED';
        } else if (backendError?.response?.status === 403) {
            safeMessage = 'Access denied. Admin privileges required.';
            errorCode = 'FORBIDDEN';
        }

        // CRITICAL: Return HTTP 200, NOT 500
        return NextResponse.json({
            success: false,
            error: errorCode,
            safeMessage: safeMessage,
            data: FALLBACK_STATS,
            meta: { healthy: false, source: 'fallback' }
        });
        // ^^^ HTTP 200 (explicitly)

    } catch (fatalError: any) {
        // 5. NUCLEAR FALLBACK: Something catastrophic happened
        // This should NEVER be reached, but we defend anyway
        console.error('[ADMIN_STATS] FATAL_UNHANDLED_ERROR:', fatalError);

        // STILL return HTTP 200 with error payload
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Service temporarily unavailable. Please refresh.',
            data: FALLBACK_STATS,
            meta: { healthy: false, source: 'emergency_fallback' }
        });
        // ^^^ HTTP 200 (no status parameter = 200)
    }
}
