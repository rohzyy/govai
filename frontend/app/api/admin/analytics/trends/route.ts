import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:8000';
        const res = await fetch(`${backendUrl}/admin/analytics/trends`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
            cache: 'no-store'
        });

        if (!res.ok) {
            return NextResponse.json({ success: false, message: 'Backend Error' }, { status: res.status });
        }

        const data = await res.json();
        return NextResponse.json(data);

    } catch (error) {
        return NextResponse.json({ success: false, message: 'Proxy Error' }, { status: 500 });
    }
}
