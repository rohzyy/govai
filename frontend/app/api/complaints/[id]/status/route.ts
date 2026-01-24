import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

export async function GET(
    request: NextRequest,
    props: { params: Promise<{ id: string }> }
) {
    try {
        const params = await props.params;
        const { id } = params;

        // Forward to backend public endpoint (no auth headers needed usually, 
        // but backendAPI might attach them if cookies exist. 
        // The backend endpoint is public so it ignores them.)
        const response = await backendAPI.get(`/complaints/${id}/status`);

        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error("Status Route Error:", error);
        return NextResponse.json(
            {
                error: 'Failed to fetch status',
                details: error.message,
                code: error.code,
                backend_status: error.response?.status,
                backend_data: error.response?.data
            },
            { status: error.response?.status || 500 }
        );
    }
}
