import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Complaint ID is required' }, { status: 400 });
        }

        // Forward to backend public endpoint
        const response = await backendAPI.get(`/complaints/${id}/status`);

        // Return the raw complaint object directly, matching frontend expectation
        return NextResponse.json(response.data);
    } catch (error: any) {
        console.error(`[GET /api/track-status] Error fetching status for ID ${request.url}:`, error.message);
        return NextResponse.json(
            {
                error: 'Failed to fetch status',
                details: error.message,
                backend_status: error.response?.status
            },
            { status: error.response?.status || 500 }
        );
    }
}
