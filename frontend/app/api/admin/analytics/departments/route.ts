import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${backendUrl}/admin/analytics/departments`, {
            headers: {
                'Content-Type': 'application/json',
                // Forward Auth Header
                'Authorization': request.headers.get('Authorization') || '',
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            return NextResponse.json({ success: false, message: 'Backend Error' }, { status: res.status });
        }

        const data = await res.json();
        // Return directly in "success: true" wrapper if Frontend AuthSafeFetch expects it,
        // OR return raw array if AuthSafeFetch handles it.
        // AuthSafeFetch logic: if (data.success === false) error.
        // If we return raw array, data.success is undefined, so it treats as success.
        // HOWEVER, consistent wrapping is safer.
        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Proxy Error' }, { status: 500 });
    }
}
