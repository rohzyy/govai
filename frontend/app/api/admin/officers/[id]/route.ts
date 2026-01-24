
import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> } // Fix for Next.js 15+ async params
) {
    try {
        const authHeader = request.headers.get('authorization');
        const headers: Record<string, string> = {};
        if (authHeader) headers['Authorization'] = authHeader;

        const body = await request.json();
        const { id } = await params;
        const response = await backendAPI.put(`/admin/officers/${id}`, body, { headers });
        return NextResponse.json(response.data);
    } catch (error: any) {
        return NextResponse.json(
            { error: error?.response?.data?.detail || 'Failed to update officer' },
            { status: error?.response?.status || 500 }
        );
    }
}
