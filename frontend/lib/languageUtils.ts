/**
 * 🌍 LANGUAGE UTILS & EMERGENCY DETECTION
 * Supports 13 Indian Languages + English
 */

export type SupportedLanguage =
    | 'en-IN' | 'hi-IN' | 'te-IN' | 'ta-IN' | 'kn-IN' | 'ml-IN'
    | 'mr-IN' | 'bn-IN' | 'gu-IN' | 'pa-IN' | 'or-IN' | 'as-IN' | 'ur-IN';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, { name: string, native: string, scriptRegex: RegExp }> = {
    'en-IN': { name: 'English', native: 'English', scriptRegex: /[a-zA-Z]/ },
    'hi-IN': { name: 'Hindi', native: 'हिंदी', scriptRegex: /[\u0900-\u097F]/ }, // Devanagari (Hindi, Marathi)
    'mr-IN': { name: 'Marathi', native: 'मराठी', scriptRegex: /[\u0900-\u097F]/ }, // Devanagari
    'te-IN': { name: 'Telugu', native: 'తెలుగు', scriptRegex: /[\u0C00-\u0C7F]/ },
    'ta-IN': { name: 'Tamil', native: 'தமிழ்', scriptRegex: /[\u0B80-\u0BFF]/ },
    'kn-IN': { name: 'Kannada', native: 'ಕನ್ನಡ', scriptRegex: /[\u0C80-\u0CFF]/ },
    'ml-IN': { name: 'Malayalam', native: 'മലയാളം', scriptRegex: /[\u0D00-\u0D7F]/ },
    'bn-IN': { name: 'Bengali', native: 'বাংলা', scriptRegex: /[\u0980-\u09FF]/ }, // Bengali, Assamese
    'as-IN': { name: 'Assamese', native: 'অসমীয়া', scriptRegex: /[\u0980-\u09FF]/ },
    'gu-IN': { name: 'Gujarati', native: 'ગુજરાતી', scriptRegex: /[\u0A80-\u0AFF]/ },
    'pa-IN': { name: 'Punjabi', native: 'ਪੰਜਾਬੀ', scriptRegex: /[\u0A00-\u0A7F]/ }, // Gurmukhi
    'or-IN': { name: 'Odia', native: 'ଓଡ଼ିଆ', scriptRegex: /[\u0B00-\u0B7F]/ },
    'ur-IN': { name: 'Urdu', native: 'اردو', scriptRegex: /[\u0600-\u06FF]/ },
};

// 🚨 EMERGENCY KEYWORDS (Pan-India)
const EMERGENCY_KEYWORDS: Record<string, string[]> = {
    'en': ['help', 'danger', 'unsafe', 'emergency', 'following', 'scared', 'police', 'panic'],
    'hi': ['मदद', 'बचाओ', 'खतरा', 'असुरक्षित', 'पीछा', 'पुलिस', 'डर'],
    'mr': ['मदत', 'वाचवा', 'धोका', 'असुरक्षित', 'पोलीस', 'भीती'],
    'te': ['సహాయం', 'ప్రమాదం', 'భయం', 'కాపాడండి', 'పోలీస్', 'వెంటాడుతున్నారు'],
    'ta': ['உதவி', 'ஆபத்து', 'பயம்', 'காப்பாற்றுங்கள்', 'போலீஸ்'],
    'kn': ['ಸಹಾಯ', 'ಅಪಾಯ', 'ಭಯ', 'ರಕ್ಷಿಸಿ', 'ಪೊಲೀಸ್'],
    'ml': ['സഹായം', 'അപകടം', 'ഭയം', 'രക്ഷിക്കൂ', 'പോലീസ്'],
    'bn': ['সাহায্য', 'বিপদ', 'ভয়', 'বাঁচাও', 'পুলিশ'],
    'gu': ['મદદ', 'જોખમ', 'ભય', 'બચાવો', 'પોલીસ'],
    'pa': ['ਮਦਦ', 'ਖਤਰਾ', 'ਡਰ', 'ਬਚਾਓ', 'ਪੁਲਿਸ'],
    'or': ['ସାହାଯ୍ୟ', 'ବିପଦ', 'ଭୟ', 'ପୋଲିସ୍'],
    'ur': ['مدد', 'خطرہ', 'ڈر', 'بچاؤ', 'پولیس']
};

/**
 * Detects if text contains emergency keywords in ANY supported language.
 * Returns true if emergency detected.
 */
export function detectEmergency(text: string): boolean {
    if (!text) return false;
    const lower = text.toLowerCase();

    return Object.values(EMERGENCY_KEYWORDS).some(keywords =>
        keywords.some(k => lower.includes(k.toLowerCase()))
    );
}

/**
 * Auto-detects language based on script.
 * Defaults to 'en-IN' if mixed or uncertain.
 */
export function detectLanguage(text: string): SupportedLanguage {
    if (!text) return 'en-IN';

    // Prioritize distinctive scripts
    for (const [code, lang] of Object.entries(SUPPORTED_LANGUAGES)) {
        if (code === 'en-IN') continue; // Check Latin last
        if (lang.scriptRegex.test(text)) {
            // Differentiate shared scripts if possible (simple heuristic for now)
            // e.g. Hindi vs Marathi (Devanagari) - Defaulting to Hindi for Devanagari is standard MVP
            // Bengali vs Assamese - Default to Bengali
            return code as SupportedLanguage;
        }
    }
    return 'en-IN';
}
