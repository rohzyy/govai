import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

/**
 * CRASH-PROOF OFFICER DASHBOARD STATS ROUTE
 * NEVER returns HTTP 500
 */

const FALLBACK_STATS = {
    total_complaints: 0,
    pending: 0,
    in_progress: 0,
    resolved: 0,
    today: 0,
};

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
            const response = await backendAPI.get('/officer/dashboard/stats', { headers });
            if (response && response.data) {
                backendData = response.data;
            }
        } catch (apiError: any) {
            console.error('[GET /api/officer/dashboard/stats] Backend error:', apiError?.message);
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
            safeMessage: 'Unable to fetch officer stats.',
            data: FALLBACK_STATS,
            meta: { healthy: false }
        });

    } catch (fatalError: any) {
        console.error('[GET /api/officer/dashboard/stats] FATAL:', fatalError);
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Service unavailable.',
            data: FALLBACK_STATS,
            meta: { healthy: false }
        });
    }
}
