import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 🎙 Transcription API Route (Next.js)
 * 
 * Satisfies the requirement for a route.ts based backend.
 * Uses Gemini 1.5 Flash to transcribe audio blobs.
 */
export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const audio = formData.get('audio') as Blob;
        const lang = formData.get('lang') as string || 'en-IN';

        if (!audio) {
            return NextResponse.json({ error: 'No audio provided' }, { status: 400 });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.STT_API_KEY || process.env.GOOGLE_API_KEY;

        console.log(`[STT] Processing request. Lang: ${lang}, Audio: ${audio.size} bytes`);

        if (!apiKey || apiKey.includes('AIzaSyCX')) {
            console.error("[STT] Error: Missing or placeholder API Key in environment.");
            return NextResponse.json({
                transcript: "TRANSCRIPTION_ERROR: Invalid or missing API Key on server. Ensure GEMINI_API_KEY is set in .env.local"
            }, { status: 200 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        // Convert Blob to ArrayBuffer
        let buffer: ArrayBuffer;
        try {
            buffer = await audio.arrayBuffer();
            console.log(`[STT] Buffer converted. Size: ${buffer.byteLength}`);
        } catch (bufErr: any) {
            console.error("[STT] Buffer Conversion Error:", bufErr);
            return NextResponse.json({ error: 'AUDIO_DECODE_FAILED', details: bufErr.message }, { status: 500 });
        }

        const base64Data = Buffer.from(buffer).toString('base64');
        const mimeType = audio.type || 'audio/webm';
        const prompt = `Transcribe this audio accurately. The language is likely ${lang} but may be mixed. Return ONLY the transcribed text.`;

        console.log(`[STT] Calling Gemini API... Mime: ${mimeType}`);

        try {
            const result = await model.generateContent([
                prompt,
                {
                    inlineData: {
                        data: base64Data,
                        mimeType: mimeType
                    }
                }
            ]);

            const text = result.response.text().trim();
            console.log(`[STT] Success! Transcript length: ${text.length}`);
            return NextResponse.json({ transcript: text });
        } catch (apiErr: any) {
            console.error("[STT] Gemini API Error:", apiErr);

            const errMsg = apiErr.message || String(apiErr);
            // Check for specific API errors
            if (errMsg.includes('expired') || errMsg.includes('API_KEY_INVALID') || errMsg.includes('400')) {
                return NextResponse.json({
                    transcript: "TRANSCRIPTION_ERROR: The Gemini API Key is EXPIRED or Invalid. Please replace it in .env.local"
                }, { status: 200 });
            }

            return NextResponse.json({ error: 'GEMINI_API_FAILED', details: errMsg }, { status: 500 });
        }

    } catch (error: any) {
        console.error("[STT API] Fatal Error:", error);
        return NextResponse.json({
            error: 'TRANSCRIPTION_FAILED',
            details: error.message,
            tip: "Check your Gemini API key and network connection."
        }, { status: 500 });
    }
}
