import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        const body = await request.json();

        let authHeader: string | null = null;
        try {
            authHeader = request.headers.get('authorization');
        } catch (e) { /* ignore */ }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json'
        };
        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await backendAPI.post(`/complaints/${id}/resolve`, body, {
            headers,
            validateStatus: (status) => status < 500
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error: any) {
        console.error(`[POST /api/complaints/[id]/resolve] Error:`, error.message);
        return NextResponse.json(
            { detail: "Internal Server Error" },
            { status: 500 }
        );
    }
}
