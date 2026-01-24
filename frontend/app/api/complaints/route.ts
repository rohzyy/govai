import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

/**
 * CRASH-PROOF COMPLAINTS ROUTE
 * 
 * RULE: This route NEVER returns HTTP 500.
 * All failures return HTTP 200 with { success: false, ... }
 */

const FALLBACK_DATA: any[] = [];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        // Safely extract auth header
        let authHeader: string | null = null;
        try {
            authHeader = request.headers.get('authorization');
        } catch (e) { /* ignore */ }

        const headers: Record<string, string> = {};
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        // Forward all query params to backend
        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        // Attempt backend call
        let backendData = null;
        try {
            const response = await backendAPI.get('/api/complaints/', { headers, params });
            if (response && response.data) {
                backendData = response.data;
            }
        } catch (apiError: any) {
            console.error('[GET /api/complaints] Backend error:', apiError?.message);
        }

        if (backendData !== null) {
            return NextResponse.json({
                success: true,
                data: backendData,
                meta: { healthy: true }
            });
        }

        // Failure: graceful degradation
        return NextResponse.json({
            success: false,
            error: 'BACKEND_ERROR',
            safeMessage: 'Unable to fetch complaints.',
            data: FALLBACK_DATA,
            meta: { healthy: false }
        });

    } catch (fatalError: any) {
        console.error('[GET /api/complaints] FATAL:', fatalError);
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Service unavailable.',
            data: FALLBACK_DATA,
            meta: { healthy: false }
        });
    }
}

export async function POST(request: NextRequest) {
    try {
        // Safe JSON parsing
        let body: any = null;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json({
                success: false,
                error: 'INVALID_JSON',
                safeMessage: 'Invalid request format.',
                data: null,
                meta: { healthy: true }
            });
        }

        // Safely extract auth header
        let authHeader: string | null = null;
        try {
            authHeader = request.headers.get('authorization');
        } catch (e) { /* ignore */ }

        const headers: Record<string, string> = {};
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        // Attempt backend call
        let backendData = null;
        try {
            const response = await backendAPI.post('/api/complaints/', body, { headers });
            if (response && response.data) {
                backendData = response.data;
            }
        } catch (apiError: any) {
            console.error('[POST /api/complaints] Backend error:', apiError?.message);

            // Extract backend error message if available
            const backendMessage = apiError?.response?.data?.detail;
            return NextResponse.json({
                success: false,
                error: 'BACKEND_ERROR',
                safeMessage: backendMessage || 'Failed to create complaint.',
                data: null,
                meta: { healthy: false }
            });
        }

        if (backendData !== null) {
            return NextResponse.json({
                success: true,
                data: backendData,
                meta: { healthy: true }
            });
        }

        return NextResponse.json({
            success: false,
            error: 'NO_RESPONSE',
            safeMessage: 'No response from server.',
            data: null,
            meta: { healthy: false }
        });

    } catch (fatalError: any) {
        console.error('[POST /api/complaints] FATAL:', fatalError);
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Service unavailable.',
            data: null,
            meta: { healthy: false }
        });
    }
}
