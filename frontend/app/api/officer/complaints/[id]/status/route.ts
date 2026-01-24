import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

/**
 * CRASH-PROOF COMPLAINT STATUS UPDATE ROUTE
 * NEVER returns HTTP 500
 */

interface RouteParams {
    params: Promise<{
        id: string;
    }>;
}

export async function PUT(request: NextRequest, props: RouteParams) {
    try {
        const params = await props.params;
        const { id } = params;
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status');

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
            const response = await backendAPI.put(
                `/officer/complaints/${id}/status`,
                null,
                { headers, params: { status } }
            );
            if (response && response.data) {
                backendData = response.data;
            }
        } catch (apiError: any) {
            console.error('[PUT /api/officer/complaints/:id/status] Backend error:', apiError?.message);

            const backendMessage = apiError?.response?.data?.detail;
            return NextResponse.json({
                success: false,
                error: 'BACKEND_ERROR',
                safeMessage: backendMessage || 'Failed to update status.',
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
        console.error('[PUT /api/officer/complaints/:id/status] FATAL:', fatalError);
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Service unavailable.',
            data: null,
            meta: { healthy: false }
        });
    }
}
