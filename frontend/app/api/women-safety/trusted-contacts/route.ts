import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

/**
 * CRASH-PROOF TRUSTED CONTACTS ROUTE
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
            const response = await backendAPI.get('/women-safety/trusted-contacts', { headers });
            if (response && response.data) {
                backendData = response.data;
            }
        } catch (apiError: any) {
            console.error('[GET /api/women-safety/trusted-contacts] Backend error:', apiError?.message);
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
            safeMessage: 'Unable to fetch trusted contacts.',
            data: FALLBACK_DATA,
            meta: { healthy: false }
        });

    } catch (fatalError: any) {
        console.error('[GET /api/women-safety/trusted-contacts] FATAL:', fatalError);
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
            const response = await backendAPI.post('/women-safety/trusted-contacts', body, { headers });
            if (response && response.data) {
                backendData = response.data;
            }
        } catch (apiError: any) {
            console.error('[POST /api/women-safety/trusted-contacts] Backend error:', apiError?.message);

            const backendMessage = apiError?.response?.data?.detail;
            return NextResponse.json({
                success: false,
                error: 'BACKEND_ERROR',
                safeMessage: backendMessage || 'Failed to add contact.',
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
        console.error('[POST /api/women-safety/trusted-contacts] FATAL:', fatalError);
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Service unavailable.',
            data: null,
            meta: { healthy: false }
        });
    }
}
