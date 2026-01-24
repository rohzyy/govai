import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

/**
 * CRASH-PROOF TOKEN REFRESH ROUTE
 * NEVER returns HTTP 500
 */

export async function POST(request: NextRequest) {
    try {
        let refreshToken: string | undefined = undefined;
        try {
            refreshToken = request.cookies.get('refresh_token')?.value;
        } catch (e) { /* ignore */ }

        let backendData = null;
        let cookies: string | string[] | undefined = undefined;

        try {
            const response = await backendAPI.post(
                '/auth/refresh',
                {},
                {
                    headers: {
                        Cookie: refreshToken ? `refresh_token=${refreshToken}` : '',
                    },
                }
            );
            if (response && response.data) {
                backendData = response.data;
                cookies = response.headers['set-cookie'];
            }
        } catch (apiError: any) {
            console.error('[POST /api/auth/refresh] Backend error:', apiError?.message);

            return NextResponse.json({
                success: false,
                error: 'REFRESH_FAILED',
                safeMessage: 'Session expired. Please login again.',
                data: null,
                meta: { healthy: false }
            });
        }

        if (backendData !== null) {
            const nextResponse = NextResponse.json({
                success: true,
                data: backendData,
                meta: { healthy: true }
            });

            if (cookies) {
                if (Array.isArray(cookies)) {
                    cookies.forEach(cookie => nextResponse.headers.append('Set-Cookie', cookie));
                } else {
                    nextResponse.headers.append('Set-Cookie', cookies);
                }
            }

            return nextResponse;
        }

        return NextResponse.json({
            success: false,
            error: 'NO_RESPONSE',
            safeMessage: 'No response from server.',
            data: null,
            meta: { healthy: false }
        });

    } catch (fatalError: any) {
        console.error('[POST /api/auth/refresh] FATAL:', fatalError);
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Service unavailable.',
            data: null,
            meta: { healthy: false }
        });
    }
}
