import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

export async function POST(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        // Body might be empty for withdraw, but we should safely check
        let body = {};
        try {
            body = await request.json();
        } catch (e) { /* ignore JSON parse error if body is empty */ }

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

        const response = await backendAPI.post(`/complaints/${id}/withdraw`, body, {
            headers,
            validateStatus: (status) => status < 500
        });

        return NextResponse.json(response.data, { status: response.status });

    } catch (error: any) {
        console.error(`[POST /api/complaints/[id]/withdraw] Error:`, error.message);
        return NextResponse.json(
            { detail: "Internal Server Error" },
            { status: 500 }
        );
    }
}
