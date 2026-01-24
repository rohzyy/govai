export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function GET() {
    const key = process.env.GEMINI_API_KEY;

    return NextResponse.json({
        env_check: {
            has_key: !!key,
            key_length: key ? key.length : 0,
            key_prefix: key ? key.substring(0, 4) : 'N/A',
            node_env: process.env.NODE_ENV,
            runtime: process.release?.name || 'unknown' // check if node
        },
        timestamp: new Date().toISOString()
    });
}
