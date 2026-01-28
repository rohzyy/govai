import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

/**
 * ⚡ QUOTA-AWARE GEMINI PIPELINE
 * 
 * Priority:
 * 1. models/gemini-2.5-pro (Best Quality)
 * 2. models/gemini-1.5-flash (High Availability / Fallback)
 * 
 * Logic:
 * - Try Primary. If 429/Error -> Try Secondary.
 * - Never throw. Return null only if ALL fail.
 */

const API_KEY = process.env.GEMINI_API_KEY;
const LOG_FILE = path.join(process.cwd(), 'gemini_server.log');

// Define Model Priority - Updated for 2025+ API
const MODEL_PIPELINE = [
    'gemini-2.0-flash',             // Free, fast, widely available
    'gemini-1.5-flash',             // Reliable fallback
    'gemini-1.5-pro',               // High quality backup
];

function log(msg: string) {
    try {
        const entry = `[${new Date().toISOString()}] ${msg}\n`;
        fs.appendFileSync(LOG_FILE, entry);
        console.log(entry.trim()); // Also stream to server console
    } catch (e) { /* ignore */ }
}

export async function askGemini(message: string): Promise<string | null> {
    // 1. Validate Environment
    if (!API_KEY) {
        log("❌ FATAL: GEMINI_API_KEY is missing.");
        return null;
    }

    if (!message || message.trim() === "") return null;

    const genAI = new GoogleGenerativeAI(API_KEY);

    // 2. Iterate through Model Pipeline
    for (const modelName of MODEL_PIPELINE) {
        try {
            log(`🔄 Attempting Model: ${modelName}`);

            const model = genAI.getGenerativeModel({ model: modelName });

            // Safety-tuned System Prompt
            const prompt = `You are a compassionate Women Safety Assistant. 
            Context: The user is asking for help or advice. 
            User Message: "${message}"
            Instructions: Keep response under 50 words. Be helpful, calm, and direct. If emergency, say "Call 100".`;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            if (text) {
                log(`✅ SUCCESS: Served by ${modelName}`);
                return text.trim();
            }

        } catch (error: any) {
            const msg = error.message || "Unknown Error";

            // Check for Quota/Rate Limit signatures
            const isQuota = msg.includes('429') || msg.includes('Quota') || msg.includes('exhausted');

            if (isQuota) {
                log(`⚠️ QUOTA HIT on ${modelName}. Switching to next model...`);
            } else {
                log(`❌ FAILED ${modelName}: ${msg}. Switching to next model...`);
            }

            // Continue loop to next model...
        }
    }

    // 3. Total Failure (All models exhausted)
    log("❌ CRITICAL: All AI models failed. Returning null (Fallback).");
    return null;
}
