import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

/**
 * CRASH-PROOF LOGOUT ROUTE
 * NEVER returns HTTP 500
 * Always clears cookies regardless of backend response
 */

export async function POST(request: NextRequest) {
    try {
        let refreshToken: string | undefined = undefined;
        try {
            refreshToken = request.cookies.get('refresh_token')?.value;
        } catch (e) { /* ignore */ }

        // Attempt backend logout (non-critical)
        try {
            await backendAPI.post(
                '/auth/logout',
                {},
                {
                    headers: {
                        Cookie: refreshToken ? `refresh_token=${refreshToken}` : '',
                    },
                }
            );
        } catch (apiError: any) {
            console.warn('[POST /api/auth/logout] Backend error (non-critical):', apiError?.message);
        }

        // Always return success and clear cookies
        const nextResponse = NextResponse.json({
            success: true,
            data: { message: 'Logged out successfully' },
            meta: { healthy: true }
        });

        // Always clear auth cookies
        nextResponse.cookies.delete('access_token');
        nextResponse.cookies.delete('refresh_token');
        nextResponse.cookies.delete('csrf_token');

        return nextResponse;

    } catch (fatalError: any) {
        console.error('[POST /api/auth/logout] FATAL:', fatalError);

        // Still clear cookies on fatal error
        const nextResponse = NextResponse.json({
            success: true,
            data: { message: 'Logged out locally' },
            meta: { healthy: false }
        });

        nextResponse.cookies.delete('access_token');
        nextResponse.cookies.delete('refresh_token');
        nextResponse.cookies.delete('csrf_token');

        return nextResponse;
    }
}
