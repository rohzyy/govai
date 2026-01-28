
import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const filter = searchParams.get('filter');
        const queryString = filter ? `?filter=${filter}` : '';

        // Extract Authorization header
        let authHeader: string | null = null;
        try {
            authHeader = request.headers.get('authorization');
        } catch (e) { /* ignore */ }

        // Prepare headers
        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (authHeader) {
            headers['Authorization'] = authHeader;
        } else {
            // Fallback: Check cookies if header is missing (for browser requests)
            const token = request.cookies.get('access_token')?.value;
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        console.log(`[Proxy] Fetching Admin Complaints: /admin/complaints${queryString}`);

        // FORCE ABSOLUTE URL
        const response = await backendAPI.get(`/admin/complaints${queryString}`, {
            headers,
            validateStatus: (status) => status < 500
        });

        if (response.status >= 200 && response.status < 300) {
            // DIRECT RETURN: Do not wrap in { success: true, data: ... }
            // Pass the backend array directly to the frontend.
            return NextResponse.json(response.data);
        } else {
            return NextResponse.json({ success: false, ...response.data }, { status: response.status });
        }

    } catch (error: any) {
        console.error(`[GET /api/admin/complaints] Error:`, error.message);
        return NextResponse.json(
            { success: false, detail: "Internal Server Error" },
            { status: 500 }
        );
    }
}
