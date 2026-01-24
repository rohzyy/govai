
import { NextRequest, NextResponse } from 'next/server';
import backendAPI from '@/lib/backend-api';

export async function GET(request: NextRequest) {
    try {
        const res = await backendAPI.get('/complaints/active');
        return NextResponse.json({
            status: 'success',
            backend_status: res.status,
            data_type: typeof res.data,
            is_array: Array.isArray(res.data),
            data: res.data,
            config_url: res.config.url,
            config_base: res.config.baseURL
        });
    } catch (error: any) {
        return NextResponse.json({
            status: 'error',
            message: error.message,
            backend_status: error.response?.status,
            backend_data: error.response?.data,
            config_url: error.config?.url,
            config_base: error.config?.baseURL
        });
    }
}
