import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

/**
 * CRASH-PROOF SIGNUP ROUTE
 * NEVER returns HTTP 500
 */

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

        let backendData = null;
        let cookies: string | string[] | undefined = undefined;

        try {
            const response = await backendAPI.post('/auth/signup', body);
            if (response && response.data) {
                backendData = response.data;
                cookies = response.headers['set-cookie'];
            }
        } catch (apiError: any) {
            console.error('[POST /api/auth/signup] Backend error:', apiError?.message);

            const backendMessage = apiError?.response?.data?.detail;
            return NextResponse.json({
                success: false,
                error: 'SIGNUP_FAILED',
                safeMessage: backendMessage || 'Signup failed. Please try again.',
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
        console.error('[POST /api/auth/signup] FATAL:', fatalError);
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Service unavailable.',
            data: null,
            meta: { healthy: false }
        });
    }
}
