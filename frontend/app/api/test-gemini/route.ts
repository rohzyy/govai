export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function GET(request: NextRequest) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return NextResponse.json({ error: "No Key" });

    const genAI = new GoogleGenerativeAI(API_KEY);
    // Trying full strings
    const models = ['models/gemini-2.5-pro', 'models/gemini-2.5-flash'];
    const results = [];

    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            const result = await model.generateContent("Hi");
            results.push({ model: m, success: true, text: (await result.response).text() });
            // If success, break early? No, let's see which works best.
        } catch (e: any) {
            results.push({ model: m, success: false, error: e.message });
        }
    }

    return NextResponse.json({ results });
}
