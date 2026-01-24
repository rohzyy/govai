/**
 * GEMINI CHAT PROXY
 * Enforces Node.js runtime to ensure SDK compatibility.
 */
export const runtime = 'nodejs'; // ⚡ CRITICAL FIX

import { NextRequest, NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';

export async function POST(request: NextRequest) {
    try {
        // 1. Safe JSON Parse
        let body;
        try {
            body = await request.json();
        } catch (e) {
            return NextResponse.json(
                { success: false, reply: 'AI_UNAVAILABLE' },
                { status: 400 }
            );
        }

        const { message } = body;

        // 2. Input Validation
        if (!message) {
            return NextResponse.json(
                { success: false, reply: 'AI_UNAVAILABLE' },
                { status: 400 }
            );
        }

        console.log(`[Gemini Chat] Processing message: "${message.substring(0, 20)}..."`);

        // 3. Call AI Wrapper
        const reply = await askGemini(message);

        // 4. Handle Response
        if (reply) {
            return NextResponse.json({ success: true, reply });
        } else {
            console.warn("[Gemini Chat] AI returned null, triggering fallback.");
            return NextResponse.json({ success: false, reply: 'AI_UNAVAILABLE' });
        }

    } catch (fatal: any) {
        // 5. Fatal Crash Guard
        console.error("🔥 [FATAL API ERROR]:", fatal);
        return NextResponse.json({ success: false, reply: 'AI_UNAVAILABLE' });
    }
}
