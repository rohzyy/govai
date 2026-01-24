
import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const cookieHeader = request.headers.get('cookie');

        const headers: Record<string, string> = {};
        if (authHeader) headers['Authorization'] = authHeader;
        if (cookieHeader) headers['Cookie'] = cookieHeader;

        const response = await backendAPI.get('/admin/departments', { headers });
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.response?.data?.detail || 'Failed to fetch departments' },
            { status: error?.response?.status || 500 }
        );
    }
}
