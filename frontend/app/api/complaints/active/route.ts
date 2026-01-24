import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

/**
 * CRASH-PROOF ACTIVE COMPLAINTS ROUTE
 * NEVER returns HTTP 500
 */

const FALLBACK_DATA: any[] = [];

export async function GET(request: NextRequest) {
    try {
        let authHeader: string | null = null;
        try {
            authHeader = request.headers.get('authorization');
        } catch (e) { /* ignore */ }

        const headers: Record<string, string> = {};
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        let backendData = null;
        try {
            // FORCE ABSOLUTE URL to prevent baseURL confusion
            // Also explicitly handle 404 as a failure, just in case axios doesn't throw
            const response = await backendAPI.get('http://127.0.0.1:8000/api/complaints/active', {
                headers,
                validateStatus: (status) => status < 500 // Allow 404 to be handled manually
            });

            if (response.status === 200 && Array.isArray(response.data)) {
                backendData = response.data;
            } else {
                console.error('[GET /api/complaints/active] Unexpected Upstream Response:', response.status, response.data);
                // If backend returned object instead of array, treat as error
                if (response.data && !Array.isArray(response.data)) {
                    throw new Error(`Invalid Data Format: ${JSON.stringify(response.data)}`);
                }
            }
        } catch (apiError: any) {
            console.error('[GET /api/complaints/active] Backend error:', apiError?.message);
        }

        if (backendData !== null) {
            return NextResponse.json(backendData);
        }

        return NextResponse.json({
            success: false,
            error: 'BACKEND_ERROR',
            safeMessage: 'Unable to fetch active complaints.',
            data: FALLBACK_DATA,
            meta: { healthy: false }
        });

    } catch (fatalError: any) {
        console.error('[GET /api/complaints/active] FATAL:', fatalError);
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Service unavailable.',
            data: FALLBACK_DATA,
            meta: { healthy: false }
        });
    }
}
