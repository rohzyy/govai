import { NextRequest, NextResponse } from 'next/server';
import { askGemini } from '@/lib/gemini';

/**
 * CRASH-PROOF GEMINI AI ROUTE
 * NEVER returns HTTP 500
 */

const FALLBACK_RESPONSE = {
    response: 'I am currently unavailable. Please try again later.',
    model: 'fallback',
};

export async function POST(request: NextRequest) {
    try {
        // Safe JSON parsing
        let body: any = null;
        try {
            body = await request.json();
        } catch (parseError) {
            return NextResponse.json({
                success: false,
                error: 'INVALID_JSON',
                safeMessage: 'Invalid request format.',
                data: FALLBACK_RESPONSE,
                meta: { healthy: true }
            });
        }

        const { message, context } = body || {};

        // Validate message
        if (!message || typeof message !== 'string') {
            return NextResponse.json({
                success: false,
                error: 'MISSING_MESSAGE',
                safeMessage: 'Message is required.',
                data: FALLBACK_RESPONSE,
                meta: { healthy: true }
            });
        }

        if (message.length > 2000) {
            return NextResponse.json({
                success: false,
                error: 'MESSAGE_TOO_LONG',
                safeMessage: 'Message too long. Please shorten your message.',
                data: FALLBACK_RESPONSE,
                meta: { healthy: true }
            });
        }

        // Attempt Gemini call
        let aiResponse: string | null = null;
        try {
             // context is ignored as askGemini doesn't support it yet
            aiResponse = await askGemini(message);
        } catch (aiError: any) {
            console.error('[POST /api/gemini] AI error:', aiError?.message);
        }

        if (aiResponse) {
            return NextResponse.json({
                success: true,
                data: { response: aiResponse, model: 'gemini' },
                meta: { healthy: true }
            });
        }

        return NextResponse.json({
            success: false,
            error: 'AI_UNAVAILABLE',
            safeMessage: 'AI service temporarily unavailable.',
            data: FALLBACK_RESPONSE,
            meta: { healthy: false }
        });

    } catch (fatalError: any) {
        console.error('[POST /api/gemini] FATAL:', fatalError);
        return NextResponse.json({
            success: false,
            error: 'INTERNAL_FAILURE',
            safeMessage: 'Service unavailable.',
            data: FALLBACK_RESPONSE,
            meta: { healthy: false }
        });
    }
}
