
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const cookieHeader = request.headers.get('cookie');

        const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:5000';

        console.log('[API Proxy] GET /admin/officers');

        const response = await fetch(`${backendUrl}/admin/officers`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { 'Authorization': authHeader }),
                ...(cookieHeader && { 'Cookie': cookieHeader }),
            },
        });

        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            console.warn('[API Proxy] Backend returned non-JSON:', contentType);
            const text = await response.text();
            try { data = JSON.parse(text); } catch (e) { data = { error: text }; }
        }

        if (!response.ok) {
            console.error('[API Proxy] Backend error:', response.status, data);
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error.message || 'Failed to fetch officers' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const authHeader = request.headers.get('authorization');
        const cookieHeader = request.headers.get('cookie');

        console.log('[API Proxy] POST /admin/officers');
        console.log('[API Proxy] Auth Header Present:', !!authHeader);
        if (authHeader) console.log('[API Proxy] Auth Header Sample:', authHeader.substring(0, 20) + '...');
        console.log('[API Proxy] Cookie Header Present:', !!cookieHeader);

        const backendUrl = process.env.BACKEND_API_URL || 'http://127.0.0.1:5000';

        const response = await fetch(`${backendUrl}/admin/officers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(authHeader && { 'Authorization': authHeader }),
                ...(cookieHeader && { 'Cookie': cookieHeader }),
            },
            body: JSON.stringify(body),
        });

        // Try to parse JSON, but handle empty/text responses
        let data;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
            data = await response.json();
        } else {
            data = await response.text();
            try { data = JSON.parse(data); } catch (e) { }
        }

        if (!response.ok) {
            console.error('[API Proxy] Backend returned error:', response.status, data);
            return NextResponse.json(data || { error: "Unknown Backend Error" }, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API Proxy] Network or parsing error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
