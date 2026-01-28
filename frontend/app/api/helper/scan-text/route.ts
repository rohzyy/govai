import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

/**
 * 🔍 Scan-Text API Route (Next.js)
 * 
 * Analyzes complaint description and returns Department, Priority, etc.
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { description } = body || {};

        if (!description || description.length < 5) {
            return NextResponse.json({
                category: "General",
                department: "General Grievance Cell",
                priority: "Medium",
                ert: "3-5 days",
                confidence: 0,
                reasoning: ["Description too short for analysis"]
            });
        }

        const apiKey = process.env.GEMINI_API_KEY || process.env.STT_API_KEY;
        if (!apiKey || apiKey.includes('AIzaSyCX')) {
            return NextResponse.json({
                category: "General",
                department: "General Grievance Cell",
                priority: "Medium",
                ert: "3-5 days",
                confidence: 0,
                reasoning: ["AI analysis temporarily unavailable due to configuration"]
            });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

        const prompt = `
        Analyze this complaint: "${description}"
        Return JSON with: category, department, priority, ert (estimated resolution time), confidence (0-100), reasoning (list of strings).
        Be realistic about priority and department.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        // Basic JSON extraction
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            return NextResponse.json(JSON.parse(jsonMatch[0]));
        }

        return NextResponse.json({
            category: "General",
            department: "General Grievance Cell",
            priority: "Medium",
            ert: "3-5 days",
            confidence: 50,
            reasoning: ["AI generated non-JSON response"]
        });

    } catch (error: any) {
        console.error("[SCAN-TEXT] Error:", error);
        return NextResponse.json({
            category: "General",
            department: "General Grievance Cell",
            priority: "Medium",
            ert: "3-5 days",
            confidence: 0,
            reasoning: ["Internal server error during analysis"]
        });
    }
}
