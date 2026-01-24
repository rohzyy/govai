import 'regenerator-runtime/runtime';
import { useState, useEffect, useCallback } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { SupportedLanguage } from '@/lib/languageUtils';

interface UseSpeechResult {
    isListening: boolean;
    transcript: string;
    detectedLang: SupportedLanguage;
    error: string | null;
    startListening: () => void;
    stopListening: () => void;
    resetTranscript: () => void;
}

export function useMultilingualSpeech(): UseSpeechResult {
    const [detectedLang, setDetectedLang] = useState<SupportedLanguage>('en-IN');
    const [customError, setCustomError] = useState<string | null>(null);

    const {
        transcript,
        listening,
        resetTranscript: resetLibTranscript,
        browserSupportsSpeechRecognition,
        isMicrophoneAvailable
    } = useSpeechRecognition();

    useEffect(() => {
        if (!browserSupportsSpeechRecognition) {
            setCustomError("Browser does not support Voice");
        }
    }, [browserSupportsSpeechRecognition]);

    const startListening = useCallback(() => {
        setCustomError(null);
        if (!isMicrophoneAvailable) {
            setCustomError("Microphone unavailable");
            return;
        }

        try {
            // Start continuous listening in the user's preferred language (defaulting to English for now)
            // You can dynamically change 'language' here based on 'detectedLang' state if you had a language selector.
            SpeechRecognition.startListening({
                continuous: true,
                language: detectedLang
            });
        } catch (e) {
            console.error("Speech Start Error:", e);
            setCustomError("Voice engine error");
        }
    }, [detectedLang, isMicrophoneAvailable]);

    const stopListening = useCallback(() => {
        SpeechRecognition.stopListening();
    }, []);

    const resetTranscript = useCallback(() => {
        resetLibTranscript();
    }, [resetLibTranscript]);

    return {
        isListening: listening,
        transcript,
        detectedLang,
        error: customError,
        startListening,
        stopListening,
        resetTranscript
    };
}
