import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

/**
 * CRASH-PROOF PANIC BUTTON ROUTE
 * NEVER returns HTTP 500
 */

export async function POST(request: NextRequest) {
    try {
        let body = {};
        try {
            body = await request.json();
        } catch (e) { /* ignore */ }

        const { location = 'Unknown', metadata = 'Panic Button' } = body as any;

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
            const response = await backendAPI.post(
                '/women-safety/panic',
                '/women-safety/panic',
                { location, metadata }, // Send as body
                { headers }
            );
            if (response && response.data) {
                backendData = response.data;
            }
        } catch (apiError: any) {
            console.error('[POST /api/women-safety/panic] Backend error:', apiError?.message);
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
            safeMessage: 'Alert may not have been sent. Please call 100 directly!',
            data: null,
            meta: { healthy: false }
        });

    } catch (fatalError: any) {
        console.error('[POST /api/women-safety/panic] FATAL:', fatalError);
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Emergency service unavailable. Call 100 immediately!',
            data: null,
            meta: { healthy: false }
        });
    }
}
