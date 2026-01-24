import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

/**
 * CRASH-PROOF OFFICER COMPLAINTS ROUTE
 * NEVER returns HTTP 500
 */

const FALLBACK_DATA: any[] = [];

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        let authHeader: string | null = null;
        try {
            authHeader = request.headers.get('authorization');
        } catch (e) { /* ignore */ }

        const headers: Record<string, string> = {};
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const params: Record<string, string> = {};
        searchParams.forEach((value, key) => {
            params[key] = value;
        });

        let backendData = null;
        try {
            const response = await backendAPI.get('/officer/complaints', { headers, params });
            if (response && response.data) {
                backendData = response.data;
            }
        } catch (apiError: any) {
            console.error('[GET /api/officer/complaints] Backend error:', apiError?.message);
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
            error: 'BACKEND_ERROR',
            safeMessage: 'Unable to fetch complaints.',
            data: FALLBACK_DATA,
            meta: { healthy: false }
        });

    } catch (fatalError: any) {
        console.error('[GET /api/officer/complaints] FATAL:', fatalError);
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Service unavailable.',
            data: FALLBACK_DATA,
            meta: { healthy: false }
        });
    }
}
